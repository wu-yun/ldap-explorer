// Manages storage of connections in VS Code settings.

import { workspace } from 'vscode';
import { LdapConnection } from './LdapConnection';
import { LdapLogger } from './LdapLogger';

export class LdapConnectionManager {

  // Get all connections from settings.
  static getConnections(): LdapConnection[] {
    return workspace.getConfiguration('ldap-explorer').get('connections', []).map(connection => new LdapConnection(
      connection["name"],
      connection["protocol"],
      connection["host"],
      connection["port"],
      connection["binddn"],
      connection["bindpwd"],
      connection["basedn"],
      connection["timeout"]
    ));
  }

  // Get connection by name, or undefined if no connection was found.
  static getConnection(name: string): Thenable<LdapConnection> {
    const filteredConnections = this.getConnections().filter(connection => connection.getName() === name);
    if (filteredConnections.length < 1) {
      return Promise.reject(`Unable to find connection '${name}' in settings`);
    }
    if (filteredConnections.length > 1) {
      LdapLogger.getOutputChannel().appendLine(`Found ${filteredConnections.length} LDAP connections with name '${name}', expected at most 1.`);
    }
    return Promise.resolve(filteredConnections[0]);
  }

  // Add new connection to settings.
  static addConnection(connection: LdapConnection): Thenable<void> {
    // Get list of existing connections.
    let connections = this.getConnections();

    // Add the new connection.
    connections.push(connection);

    // Save new list of connections and return Thenable.
    return workspace.getConfiguration('ldap-explorer').update('connections', connections, true);
  }

  // Edit existing connection in settings.
  static editConnection(newConnection: LdapConnection, existingConnection: LdapConnection): Thenable<void> {
    // Get list of existing connections.
    let connections = this.getConnections();

    // Get index of connection to edit.
    const index = connections.findIndex(con => con.getName() === existingConnection.getName());
    if (index < 0) {
      return Promise.reject(`Connection '${existingConnection.getName()}' does not exist in settings`);
    }

    // Replace existing connection with new connection.
    connections[index] = newConnection;

    // Save new list of connections and return Thenable.
    return workspace.getConfiguration('ldap-explorer').update('connections', connections, true);
  }

  // Remove existing connection from settings.
  static removeConnection(connection: LdapConnection): Thenable<void> {
    // Get list of existing connections.
    const connections = this.getConnections();

    // Get index of connection to delete.
    const index = connections.findIndex(con => con.getName() === connection.getName());
    if (index < 0) {
      return Promise.reject(`Connection '${connection.getName()}' does not exist in settings`);
    }

    // Remove connection from the list.
    connections.splice(index, 1);

    // Save new list of connections and return Thenable.
    return workspace.getConfiguration('ldap-explorer').update('connections', connections, true);
  }

}
