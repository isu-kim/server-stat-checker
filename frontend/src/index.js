import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Card, Modal, Table, Badge, Button, Form } from "@themesberg/react-bootstrap";
import axios from 'axios';

import "./scss/volt.scss";
import "./main.css";
import "react-datetime/css/react-datetime.css";

import serverData from "./servers.json";

const App = () => {
  const [servers, setServers] = useState([]);
  const [modalServer, setModalServer] = useState(null);

  useEffect(() => {
    const initializeServers = () => {
      const initialServerData = serverData.map((server) => ({
        ...server,
        status: 'Waiting...',
        isPortOpen: false,
      }));

      setServers(initialServerData);
    };

    initializeServers();
  }, []);

  useEffect(() => {
    const fetchServerData = async () => {
      const updatedServers = await Promise.allSettled(
        serverData.map(async (server) => {
          const { ip, port } = server;
          const isPortOpen = await checkPortStatus(ip, port);
          const status = isPortOpen ? 'Online' : 'Offline';

          return { ...server, status, isPortOpen };
        })
      );

      const resolvedServers = updatedServers
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

      setServers((prevServers) =>
        prevServers.map((server, index) =>
          index < resolvedServers.length ? resolvedServers[index] : server
        )
      );
    };

    fetchServerData();
  }, []);

  const checkPortStatus = async (ip, port) => {
    try {
      const response = await axios.post('/api/check', { ip, port }, { timeout: 2000 });
      return response.status === 200;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const renderTypeBadge = (type) => {
    let variant = "primary";

    if (type === "Bare Metal") {
      variant = "primary";
    } else if (type === "VPS") {
      variant = "secondary";
    }

    return <Badge bg={variant}>{type}</Badge>;
  };

  const renderStatusBadge = (isPortOpen, status) => {
    if (status === 'Waiting...') {
      return <Badge bg="warning">{status}</Badge>;
    } else if (isPortOpen) {
      return <Badge bg="success">Online</Badge>;
    }
    return <Badge bg="danger">Offline</Badge>;
  };

  const handleModalOpen = (server) => {
    setModalServer(server);
  };

  const handleModalClose = () => {
    setModalServer(null);
  };

  const maskIP = (ip) => {
    const parts = ip.split('.');
    parts[2] = '***';
    parts[3] = '***';
    return parts.join('.');
  };

  const handleCopyToClipboard = (ip) => {
    const password = prompt("Enter the password to copy the IP address:");
  
    if (password) {
      // Convert the input password to a SHA-256 hash
      async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");
        return hashHex;
      }
  
      hashPassword(password)
        .then(async inputPasswordHash => {
          const envPassword = process.env.REACT_APP_PASSWORD;
          const envPasswordHash = await hashPassword(envPassword);
  
          if (inputPasswordHash === envPasswordHash) {
            const fallbackCopyToClipboard = (text) => {
              const textArea = document.createElement("textarea");
              textArea.value = text;
              textArea.style.position = "fixed";
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
  
              try {
                const successful = document.execCommand("copy");
                const message = successful ? "IP was copied to clipboard" : "Failed to copy IP to clipboard";
                alert(message);
              } catch (error) {
                console.error("Failed to copy IP to clipboard:", error);
                alert("Failed to copy IP to clipboard");
              }
  
              document.body.removeChild(textArea);
            };
  
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(ip)
                .then(() => {
                  alert("IP was copied to clipboard");
                })
                .catch((error) => {
                  console.error("Failed to copy IP to clipboard:", error);
                  fallbackCopyToClipboard(ip);
                });
            } else {
              fallbackCopyToClipboard(ip);
            }
          } else {
            alert("Incorrect password. IP address not copied.");
          }
        })
        .catch(error => {
          console.error("Failed to hash the password:", error);
          alert("An error occurred. Please try again.");
        });
    }
  };
  
  return (
    <div className="container mt-4">
      <Card className="mt-4">
        <Card.Body>
          <h1 className="text-center mb-4">Service Status Checker</h1>

          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {servers.map((server, index) => (
                <tr key={index}>
                  <td>{server.name}</td>
                  <td>{server.description}</td>
                  <td>{renderTypeBadge(server.type)}</td>
                  <td>{renderStatusBadge(server.isPortOpen, server.status)}</td>
                  <td>
                    <Button variant="primary" size="sm" onClick={() => handleModalOpen(server)}>Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="text-center mt-4">
            <p>
              2023 &copy; isu.kim | Made with ❤ by <a href="https://github.com/isu-kim">Isu Kim</a>
            </p>
          </div>
        </Card.Body>
      </Card>

      {modalServer && (
        <Modal show={Boolean(modalServer)} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Server Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>IP Address</Form.Label>
              <div className="d-flex align-items-center">
                <input type="text" className="form-control" value={maskIP(modalServer.ip)} readOnly />
                <Button variant="outline-primary" className="ms-2" onClick={() => handleCopyToClipboard(modalServer.ip)}>
                  Copy
                </Button>
              </div>
            </Form.Group>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
