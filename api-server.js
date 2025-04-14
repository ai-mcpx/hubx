import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.API_PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.get('/api/servers', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'servers.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading servers.json:', err);
      return res.status(500).json({ error: 'Failed to read servers.json' });
    }

    try {
      const servers = JSON.parse(data);
      res.json(servers);
    } catch (parseError) {
      console.error('Error parsing servers.json:', parseError);
      res.status(500).json({ error: 'Failed to parse servers.json' });
    }
  });
});

app.get('/api/servers/:key', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'servers.json');
  const serverKey = req.params.key;

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading servers.json:', err);
      return res.status(500).json({ error: 'Failed to read servers.json' });
    }

    try {
      const servers = JSON.parse(data);
      const server = servers.find(s => s.key === serverKey);

      if (!server) {
        return res.status(404).json({ error: 'Server not found' });
      }

      res.json(server);
    } catch (parseError) {
      console.error('Error parsing servers.json:', parseError);
      res.status(500).json({ error: 'Failed to parse servers.json' });
    }
  });
});

app.post('/api/servers', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'servers.json');
  const newServer = req.body;

  if (!newServer || !newServer.id || !newServer.name) {
    return res.status(400).json({ error: 'Invalid server data. ID and name are required.' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading servers.json:', err);
      return res.status(500).json({ error: 'Failed to read servers.json' });
    }

    try {
      const servers = JSON.parse(data);

      if (servers.find(s => s.id === newServer.id)) {
        return res.status(400).json({ error: 'Server with the same ID already exists.' });
      }

      servers.push(newServer);

      fs.writeFile(filePath, JSON.stringify(servers, null, 2), 'utf8', writeErr => {
        if (writeErr) {
          console.error('Error writing to servers.json:', writeErr);
          return res.status(500).json({ error: 'Failed to save new server.' });
        }

        res.status(201).json(newServer);
      });
    } catch (parseError) {
      console.error('Error parsing servers.json:', parseError);
      res.status(500).json({ error: 'Failed to parse servers.json' });
    }
  });
});

app.put('/api/servers/:key', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'servers.json');
  const serverKey = req.params.key;
  const updatedServer = req.body;

  if (!updatedServer || !updatedServer.name) {
    return res.status(400).json({ error: 'Invalid server data. Name is required.' });
  }

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading servers.json:', err);
      return res.status(500).json({ error: 'Failed to read servers.json' });
    }

    try {
      let servers = JSON.parse(data);
      const serverIndex = servers.findIndex(s => s.key === serverKey);

      if (serverIndex === -1) {
        return res.status(404).json({ error: 'Server not found' });
      }

      servers[serverIndex] = { ...servers[serverIndex], ...updatedServer };

      fs.writeFile(filePath, JSON.stringify(servers, null, 2), 'utf8', writeErr => {
        if (writeErr) {
          console.error('Error writing to servers.json:', writeErr);
          return res.status(500).json({ error: 'Failed to update server.' });
        }

        res.status(200).json(servers[serverIndex]);
      });
    } catch (parseError) {
      console.error('Error parsing servers.json:', parseError);
      res.status(500).json({ error: 'Failed to parse servers.json' });
    }
  });
});

app.delete('/api/servers/:key', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'servers.json');
  const serverKey = req.params.key;

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading servers.json:', err);
      return res.status(500).json({ error: 'Failed to read servers.json' });
    }

    try {
      let servers = JSON.parse(data);
      const serverIndex = servers.findIndex(s => s.key === serverKey);

      if (serverIndex === -1) {
        return res.status(404).json({ error: 'Server not found' });
      }

      servers.splice(serverIndex, 1);

      fs.writeFile(filePath, JSON.stringify(servers, null, 2), 'utf8', writeErr => {
        if (writeErr) {
          console.error('Error writing to servers.json:', writeErr);
          return res.status(500).json({ error: 'Failed to delete server.' });
        }

        res.status(200).json({ message: 'Server deleted successfully' });
      });
    } catch (parseError) {
      console.error('Error parsing servers.json:', parseError);
      res.status(500).json({ error: 'Failed to parse servers.json' });
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
