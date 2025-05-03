const { Api } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { TelegramClient } = require('telegram');
const input = require('input');
const fs = require('fs');
const path = require('path');

// Storage for sessions and config
const SESSIONS_DIR = path.join(__dirname, '../sessions');
const CONFIG_DIR = path.join(__dirname, '../config');

// Create directories if they don't exist
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Telegram client instances
const clients = {};

// Pending auth sessions - store phone code hash for 2FA
const pendingAuth = {};

// Helper to save parser config
const saveParserConfigToFile = (config) => {
  fs.writeFileSync(
    path.join(CONFIG_DIR, 'parser-config.json'),
    JSON.stringify(config, null, 2)
  );
};

// Helper to load parser config
const loadParserConfig = () => {
  try {
    if (fs.existsSync(path.join(CONFIG_DIR, 'parser-config.json'))) {
      return JSON.parse(
        fs.readFileSync(path.join(CONFIG_DIR, 'parser-config.json'), 'utf8')
      );
    }
  } catch (error) {
    console.error('Error loading parser config:', error);
  }
  return { template: '', useRegex: false };
};

// Helper to save groups
const saveGroupsToFile = (phoneNumber, groups) => {
  fs.writeFileSync(
    path.join(CONFIG_DIR, `groups-${phoneNumber}.json`),
    JSON.stringify(groups, null, 2)
  );
};

// Helper to load groups
const loadGroups = (phoneNumber) => {
  try {
    if (fs.existsSync(path.join(CONFIG_DIR, `groups-${phoneNumber}.json`))) {
      return JSON.parse(
        fs.readFileSync(path.join(CONFIG_DIR, `groups-${phoneNumber}.json`), 'utf8')
      );
    }
  } catch (error) {
    console.error('Error loading groups:', error);
  }
  return [];
};

// Initialize authentication
exports.initAuth = async (req, res) => {
  try {
    const { apiId, apiHash, phoneNumber } = req.body;

    if (!apiId || !apiHash || !phoneNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate phone number format
    if (!phoneNumber.startsWith('+')) {
      return res.status(400).json({ error: 'Phone number must start with country code (e.g., +1234567890)' });
    }

    // Create a new StringSession
    const stringSession = new StringSession('');
    
    // Create client instance
    const client = new TelegramClient(
      stringSession,
      parseInt(apiId),
      apiHash,
      { connectionRetries: 5 }
    );

    // Store client in memory
    clients[phoneNumber] = client;

    // Connect
    console.log(`Attempting to connect with phone ${phoneNumber}`);
    await client.connect();
    
    // Check if already has a valid session
    const sessionFile = path.join(SESSIONS_DIR, `${phoneNumber}.session`);
    if (fs.existsSync(sessionFile)) {
      console.log(`Found existing session for ${phoneNumber}, trying to use it`);
      const sessionString = fs.readFileSync(sessionFile, 'utf8');
      const loadedSession = new StringSession(sessionString);
      
      try {
        // Try to use the saved session
        const loadedClient = new TelegramClient(
          loadedSession,
          parseInt(apiId),
          apiHash,
          { connectionRetries: 5 }
        );
        
        await loadedClient.connect();
        if (await loadedClient.checkAuthorization()) {
          // Session is valid
          clients[phoneNumber] = loadedClient;
          console.log(`Successfully authenticated using saved session for ${phoneNumber}`);
          return res.status(200).json({ success: true, alreadyAuthorized: true });
        }
      } catch (error) {
        // Session is invalid, proceed with new login
        console.log('Saved session is invalid, proceeding with new login:', error.message);
      }
    }

    // Request code
    console.log(`Requesting auth code for ${phoneNumber}`);
    try {
      const result = await client.sendCode(
        {
          apiId: parseInt(apiId),
          apiHash: apiHash,
        },
        phoneNumber
      );

      // Store the phone code hash for later
      pendingAuth[phoneNumber] = {
        phoneCodeHash: result.phoneCodeHash,
        apiId,
        apiHash
      };

      console.log(`Auth code requested for ${phoneNumber}, awaiting verification`);
      res.status(200).json({ success: true, awaitingCode: true });
    } catch (error) {
      console.error('Error sending code:', error);
      
      // Check for specific Telegram errors
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('FLOOD_WAIT')) {
        const waitTime = errorMessage.match(/\d+/); // Extract wait time if available
        const waitMsg = waitTime ? `Please try again after ${waitTime[0]} seconds.` : 'Please try again later.';
        return res.status(429).json({ error: `Too many requests: ${waitMsg}` });
      }
      
      if (errorMessage.includes('PHONE_NUMBER_INVALID')) {
        return res.status(400).json({ error: 'The phone number is invalid. Please check the format and try again.' });
      }
      
      if (errorMessage.includes('API_ID_INVALID')) {
        return res.status(400).json({ error: 'The API ID is invalid. Please check your credentials.' });
      }
      
      // Generic error
      res.status(500).json({ error: `Failed to send verification code: ${error.message}` });
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    res.status(500).json({ error: error.message });
  }
};

// Confirm authentication with code
exports.confirmAuth = async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;

    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Missing phone number or verification code' });
    }

    if (!clients[phoneNumber]) {
      return res.status(400).json({ error: 'No pending authentication for this phone number' });
    }

    if (!pendingAuth[phoneNumber]) {
      return res.status(400).json({ error: 'Authentication session expired. Please start again.' });
    }

    const client = clients[phoneNumber];
    const { phoneCodeHash } = pendingAuth[phoneNumber];

    console.log(`Attempting to sign in with code for ${phoneNumber}`);
    
    try {
      // Sign in with the code
      await client.signIn({
        phoneNumber,
        phoneCode: code, 
        phoneCodeHash
      });
      
      // Check if 2FA is needed (password)
      const isPasswordNeeded = await client.isUserAuthorized();
      
      if (!isPasswordNeeded) {
        // Handle 2FA if needed
        console.log(`2FA needed for ${phoneNumber}, asking for password`);
        return res.status(200).json({ 
          success: false, 
          needs2FA: true,
          message: "Two-factor authentication is required. Please provide your password."
        });
      }

      // Save the session string to a file
      const sessionString = client.session.save();
      fs.writeFileSync(
        path.join(SESSIONS_DIR, `${phoneNumber}.session`),
        sessionString
      );

      // Clean up the pending auth
      delete pendingAuth[phoneNumber];

      console.log(`Successfully authenticated for ${phoneNumber}`);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error during sign in:', error);
      
      // Check for specific Telegram errors
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('PHONE_CODE_INVALID')) {
        return res.status(400).json({ error: 'PHONE_CODE_INVALID: The verification code is incorrect.' });
      }
      
      if (errorMessage.includes('PHONE_CODE_EXPIRED')) {
        delete pendingAuth[phoneNumber];
        return res.status(400).json({ error: 'PHONE_CODE_EXPIRED: The verification code has expired. Please restart authentication.' });
      }
      
      if (errorMessage.includes('SESSION_PASSWORD_NEEDED')) {
        return res.status(200).json({ 
          success: false, 
          needs2FA: true,
          message: "Two-factor authentication is required. Please provide your password."
        });
      }
      
      // Generic error
      res.status(500).json({ error: `Error during sign in: ${error.message}` });
    }
  } catch (error) {
    console.error('Error confirming auth:', error);
    res.status(500).json({ error: error.message });
  }
};

// Handle 2FA password verification
exports.confirm2FA = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ error: 'Missing phone number or password' });
    }

    if (!clients[phoneNumber]) {
      return res.status(400).json({ error: 'No pending authentication for this phone number' });
    }

    const client = clients[phoneNumber];

    console.log(`Attempting 2FA login for ${phoneNumber}`);
    
    try {
      // Submit 2FA password
      await client.checkPassword(password);
      
      // Save the session string to a file
      const sessionString = client.session.save();
      fs.writeFileSync(
        path.join(SESSIONS_DIR, `${phoneNumber}.session`),
        sessionString
      );

      // Clean up the pending auth
      delete pendingAuth[phoneNumber];

      console.log(`Successfully authenticated with 2FA for ${phoneNumber}`);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error during 2FA login:', error);
      
      // Check for specific Telegram errors
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('PASSWORD_HASH_INVALID')) {
        return res.status(400).json({ error: 'The password is incorrect.' });
      }
      
      // Generic error
      res.status(500).json({ error: `Error during 2FA login: ${error.message}` });
    }
  } catch (error) {
    console.error('Error confirming 2FA:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all dialogs/groups
exports.getGroups = async (req, res) => {
  try {
    const { phoneNumber } = req.query;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Missing phone number' });
    }

    // Check if we have a saved session
    const sessionFile = path.join(SESSIONS_DIR, `${phoneNumber}.session`);
    if (!fs.existsSync(sessionFile)) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const sessionString = fs.readFileSync(sessionFile, 'utf8');
    const session = new StringSession(sessionString);

    // Get API credentials from request
    const { apiId, apiHash } = req.query;
    
    if (!apiId || !apiHash) {
      return res.status(400).json({ error: 'Missing API credentials' });
    }

    // Create client with saved session
    const client = new TelegramClient(
      session,
      parseInt(apiId),
      apiHash,
      { connectionRetries: 5 }
    );

    // Connect and get dialogs
    await client.connect();
    
    // Check if client is authorized
    if (!await client.checkAuthorization()) {
      return res.status(401).json({ error: 'Session expired' });
    }
    
    // Get actual groups
    const result = await client.getDialogs();
    
    // Store client in memory for later use
    clients[phoneNumber] = client;
    
    // Filter only channels and groups
    const groups = result.filter(
      dialog => dialog.isChannel || dialog.isGroup
    ).map(dialog => ({
      id: dialog.id.toString(),
      name: dialog.title,
      isChannel: dialog.isChannel,
      isGroup: dialog.isGroup
    }));
    
    // Get stored active groups
    const savedGroups = loadGroups(phoneNumber);
    
    // Merge with saved groups data
    const mergedGroups = groups.map(group => {
      const savedGroup = savedGroups.find(g => g.id === group.id);
      return {
        ...group,
        active: savedGroup ? savedGroup.active : false,
        signalsCount: savedGroup ? savedGroup.signalsCount : 0,
        lastSignal: savedGroup ? savedGroup.lastSignal : 'N/A',
        memberCount: 0 // Can't easily get member count with telegram-js
      };
    });
    
    res.status(200).json(mergedGroups);
  } catch (error) {
    console.error('Error getting groups:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add group by name or URL
exports.addGroup = async (req, res) => {
  try {
    const { phoneNumber, name, url } = req.body;

    if (!phoneNumber || (!name && !url)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if we have a saved session
    const sessionFile = path.join(SESSIONS_DIR, `${phoneNumber}.session`);
    if (!fs.existsSync(sessionFile)) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get API credentials from request
    const { apiId, apiHash } = req.body;
    
    if (!apiId || !apiHash) {
      return res.status(400).json({ error: 'Missing API credentials' });
    }

    const sessionString = fs.readFileSync(sessionFile, 'utf8');
    const session = new StringSession(sessionString);

    // Get client or create a new one
    let client = clients[phoneNumber];
    
    if (!client) {
      client = new TelegramClient(
        session,
        parseInt(apiId),
        apiHash,
        { connectionRetries: 5 }
      );
      
      await client.connect();
      clients[phoneNumber] = client;
    }
    
    // Find or join channel/group
    let entity;
    
    if (url) {
      // Try to join using invite link
      try {
        entity = await client.invoke(new Api.messages.ImportChatInvite({
          hash: url.split('/').pop(),
        }));
      } catch (error) {
        console.error('Error joining group:', error);
        return res.status(400).json({ error: 'Could not join group with the provided URL' });
      }
    } else {
      // Try to resolve by username
      try {
        entity = await client.getEntity(name);
      } catch (error) {
        return res.status(404).json({ error: 'Group not found' });
      }
    }

    // Get saved groups
    const savedGroups = loadGroups(phoneNumber);
    
    // Add new group
    const newGroup = {
      id: entity.id.toString(),
      name: entity.title || name,
      active: true,
      signalsCount: 0,
      lastSignal: 'N/A',
      memberCount: 0
    };
    
    // Check if group already exists
    const existingGroupIndex = savedGroups.findIndex(g => g.id === newGroup.id);
    
    if (existingGroupIndex >= 0) {
      // Update existing
      savedGroups[existingGroupIndex] = newGroup;
    } else {
      // Add new
      savedGroups.push(newGroup);
    }
    
    // Save updated groups
    saveGroupsToFile(phoneNumber, savedGroups);
    
    res.status(200).json(newGroup);
  } catch (error) {
    console.error('Error adding group:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update group status (active/inactive)
exports.updateGroupStatus = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const { id } = req.params;
    const { active } = req.body;

    if (!phoneNumber || id === undefined || active === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get saved groups
    const savedGroups = loadGroups(phoneNumber);
    
    // Find group
    const groupIndex = savedGroups.findIndex(g => g.id === id);
    
    if (groupIndex === -1) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Update status
    savedGroups[groupIndex].active = active;
    
    // Save updated groups
    saveGroupsToFile(phoneNumber, savedGroups);
    
    res.status(200).json(savedGroups[groupIndex]);
  } catch (error) {
    console.error('Error updating group status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Remove group
exports.removeGroup = async (req, res) => {
  try {
    const { phoneNumber } = req.query;
    const { id } = req.params;

    if (!phoneNumber || !id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get saved groups
    const savedGroups = loadGroups(phoneNumber);
    
    // Find and remove group
    const updatedGroups = savedGroups.filter(g => g.id !== id);
    
    // If no change, group didn't exist
    if (updatedGroups.length === savedGroups.length) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Save updated groups
    saveGroupsToFile(phoneNumber, updatedGroups);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error removing group:', error);
    res.status(500).json({ error: error.message });
  }
};

// Test parsing a signal with a template
exports.testParseTemplate = async (req, res) => {
  try {
    const { template, signal, useRegex } = req.body;

    if (!template || !signal) {
      return res.status(400).json({ error: 'Missing template or signal' });
    }

    let result = {};

    if (useRegex) {
      // Create regex patterns from the template
      try {
        // Extract pair
        const pairRegex = /#([A-Z]+)/;
        const pairMatch = signal.match(pairRegex);
        
        // Extract type
        const typeRegex = /Type:\s*([A-Z]+)/i;
        const typeMatch = signal.match(typeRegex);
        
        // Extract entry
        const entryRegex = /Entry:\s*([0-9.,\-]+)/i;
        const entryMatch = signal.match(entryRegex);
        
        // Extract take profit levels
        const tpRegex = /TP:?\s*([0-9.,\s]+)/i;
        const tpMatch = signal.match(tpRegex);
        
        // Extract stop loss
        const slRegex = /SL:?\s*([0-9.,\-]+)/i;
        const slMatch = signal.match(slRegex);
        
        result = {
          pair: pairMatch ? pairMatch[1] : null,
          type: typeMatch ? typeMatch[1] : null,
          entry: entryMatch ? entryMatch[1] : null,
          tp: tpMatch ? tpMatch[1].split(',').map(t => t.trim()) : [],
          sl: slMatch ? slMatch[1] : null
        };
      } catch (error) {
        console.error('Regex parsing error:', error);
        return res.status(400).json({ error: 'Invalid regex pattern' });
      }
    } else {
      // Template-based parsing (simplified implementation)
      // Extract pair
      const pairRegex = /#([A-Z]+)/;
      const pairMatch = signal.match(pairRegex);
      
      // Extract type
      const typeRegex = /Type:?\s*([A-Z]+)/i;
      const typeMatch = signal.match(typeRegex);
      
      // Extract entry
      const entryRegex = /Entry:?\s*([0-9.,\-]+)/i;
      const entryMatch = signal.match(entryRegex);
      
      // Extract take profit levels
      const tpRegex = /TP:?\s*([0-9.,\s]+)/i;
      const tpMatch = signal.match(tpRegex);
      
      // Extract stop loss
      const slRegex = /SL:?\s*([0-9.,\-]+)/i;
      const slMatch = signal.match(slRegex);
      
      result = {
        pair: pairMatch ? pairMatch[1] : null,
        type: typeMatch ? typeMatch[1] : null,
        entry: entryMatch ? entryMatch[1] : null,
        tp: tpMatch ? tpMatch[1].split(',').map(t => t.trim()) : [],
        sl: slMatch ? slMatch[1] : null
      };
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error testing parse template:', error);
    res.status(500).json({ error: error.message });
  }
};

// Save parser configuration
exports.saveParserConfig = async (req, res) => {
  try {
    const { template, useRegex } = req.body;

    if (!template) {
      return res.status(400).json({ error: 'Missing template' });
    }

    const config = {
      template,
      useRegex: useRegex || false
    };

    // Save to file
    saveParserConfigToFile(config);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving parser config:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get recent signals from active groups
exports.getSignals = async (req, res) => {
  try {
    const { phoneNumber, groupId, limit = 10 } = req.query;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Missing phone number' });
    }

    // Check if we have a saved session
    const sessionFile = path.join(SESSIONS_DIR, `${phoneNumber}.session`);
    if (!fs.existsSync(sessionFile)) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get API credentials from request
    const { apiId, apiHash } = req.query;
    
    if (!apiId || !apiHash) {
      return res.status(400).json({ error: 'Missing API credentials' });
    }

    const sessionString = fs.readFileSync(sessionFile, 'utf8');
    const session = new StringSession(sessionString);

    // Get client or create a new one
    let client = clients[phoneNumber];
    
    if (!client) {
      client = new TelegramClient(
        session,
        parseInt(apiId),
        apiHash,
        { connectionRetries: 5 }
      );
      
      await client.connect();
      clients[phoneNumber] = client;
    }

    // Get parser config
    const parserConfig = loadParserConfig();
    
    // Get saved groups (active ones)
    const savedGroups = loadGroups(phoneNumber).filter(g => g.active);
    
    // If groupId is provided, filter to that specific group
    const groupsToFetch = groupId 
      ? savedGroups.filter(g => g.id === groupId)
      : savedGroups;
    
    if (groupsToFetch.length === 0) {
      return res.status(groupId ? 404 : 200).json(
        groupId ? { error: 'Group not found or inactive' } : []
      );
    }

    // Fetch messages from each group
    const signals = [];
    
    for (const group of groupsToFetch) {
      try {
        // Get entity
        const entity = await client.getEntity(group.id);
        
        // Get messages
        const messages = await client.getMessages(entity, {
          limit: parseInt(limit)
        });
        
        // Process messages
        for (const message of messages) {
          if (message.text) {
            // Try to parse with configured template
            let parsed = null;
            
            try {
              parsed = await exports.testParseTemplate({
                body: {
                  template: parserConfig.template,
                  signal: message.text,
                  useRegex: parserConfig.useRegex
                }
              }, {
                status: () => ({ json: (data) => data })
              });
            } catch (error) {
              console.error('Error parsing message:', error);
            }
            
            // Only add if it appears to be a signal (has at least pair and type)
            if (parsed && parsed.pair && parsed.type) {
              signals.push({
                id: `${group.id}-${message.id}`,
                groupId: group.id,
                groupName: group.name,
                messageId: message.id,
                text: message.text,
                timestamp: new Date(message.date * 1000).toISOString(),
                parsed
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching messages for group ${group.id}:`, error);
        // Continue with other groups
      }
    }
    
    res.status(200).json(signals);
  } catch (error) {
    console.error('Error getting signals:', error);
    res.status(500).json({ error: error.message });
  }
};
