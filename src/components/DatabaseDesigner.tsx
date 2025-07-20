import React, { useState } from 'react';
import { Plus, Database, Table, Edit, Trash2, Link, Save } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface TableField {
  name: string;
  type: string;
  nullable: boolean;
  primary: boolean;
  autoIncrement: boolean;
}

interface DatabaseTable {
  name: string;
  fields: TableField[];
}

export const DatabaseDesigner: React.FC = () => {
  const { addDatabaseTable, databaseTables } = useProject();
  const [tables, setTables] = useState<DatabaseTable[]>(databaseTables);

  const [showAddTable, setShowAddTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [editingTable, setEditingTable] = useState<string | null>(null);

  // Update local state when context changes
  React.useEffect(() => {
    setTables(databaseTables);
  }, [databaseTables]);

  const addTable = () => {
    if (newTableName.trim()) {
      const newTable: DatabaseTable = {
        name: newTableName.trim(),
        fields: [
          { name: 'id', type: 'INT', nullable: false, primary: true, autoIncrement: true }
        ]
      };
      setTables([...tables, newTable]);
      setNewTableName('');
      setShowAddTable(false);
      addDatabaseTable(newTable);
    }
  };

  const deleteTable = (tableName: string) => {
    setTables(tables.filter(t => t.name !== tableName));
  };

  const addField = (tableName: string) => {
    setTables(tables.map(table => {
      if (table.name === tableName) {
        return {
          ...table,
          fields: [...table.fields, {
            name: 'new_field',
            type: 'VARCHAR(255)',
            nullable: true,
            primary: false,
            autoIncrement: false
          }]
        };
      }
      return table;
    }));
  };

  const generateSQL = () => {
    let sql = '-- Generated Database Schema\n\n';
    
    tables.forEach(table => {
      sql += `CREATE TABLE ${table.name} (\n`;
      
      const fieldDefinitions = table.fields.map(field => {
        let definition = `  ${field.name} ${field.type}`;
        if (!field.nullable) definition += ' NOT NULL';
        if (field.autoIncrement) definition += ' AUTO_INCREMENT';
        return definition;
      });
      
      sql += fieldDefinitions.join(',\n');
      
      const primaryKeys = table.fields.filter(f => f.primary).map(f => f.name);
      if (primaryKeys.length > 0) {
        sql += `,\n  PRIMARY KEY (${primaryKeys.join(', ')})`;
      }
      
      sql += '\n);\n\n';
    });

    // Add foreign key constraints
    sql += '-- Foreign Key Constraints\n';
    sql += 'ALTER TABLE posts ADD CONSTRAINT fk_posts_user FOREIGN KEY (user_id) REFERENCES users(id);\n';
    
    return sql;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">VISUAL DESIGNER</h3>
        <button
          onClick={() => {
            const sql = generateSQL();
            navigator.clipboard.writeText(sql);
          }}
          className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors flex items-center space-x-1"
        >
          <Save size={12} />
          <span>Export SQL</span>
        </button>
      </div>

      {showAddTable ? (
        <div className="bg-gray-700 rounded-lg p-3">
          <input
            type="text"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            placeholder="Table name"
            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm mb-2"
            onKeyPress={(e) => e.key === 'Enter' && addTable()}
          />
          <div className="flex space-x-2">
            <button
              onClick={addTable}
              className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddTable(false)}
              className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddTable(true)}
          className="w-full p-3 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Plus size={16} />
          <span className="text-sm">Add Table</span>
        </button>
      )}
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tables.map((table) => (
          <div key={table.name} className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Table size={16} className="text-blue-400" />
                <span className="text-sm font-medium">{table.name}</span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => addField(table.name)}
                  className="p-1 hover:bg-gray-600 rounded transition-colors"
                  title="Add field"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={() => setEditingTable(editingTable === table.name ? null : table.name)}
                  className="p-1 hover:bg-gray-600 rounded transition-colors"
                  title="Edit table"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={() => deleteTable(table.name)}
                  className="p-1 hover:bg-gray-600 rounded transition-colors text-red-400"
                  title="Delete table"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            
            {editingTable === table.name ? (
              <div className="space-y-2">
                {table.fields.map((field, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                    <input
                      type="text"
                      value={field.name}
                      className="bg-gray-600 border border-gray-500 rounded px-2 py-1"
                      placeholder="Field name"
                    />
                    <select
                      value={field.type}
                      className="bg-gray-600 border border-gray-500 rounded px-2 py-1"
                    >
                      <option>INT</option>
                      <option>VARCHAR(255)</option>
                      <option>TEXT</option>
                      <option>TIMESTAMP</option>
                      <option>BOOLEAN</option>
                      <option>DECIMAL(10,2)</option>
                    </select>
                    <div className="flex items-center space-x-1">
                      <label className="flex items-center">
                        <input type="checkbox" checked={field.primary} className="mr-1" />
                        <span>PK</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" checked={!field.nullable} className="mr-1" />
                        <span>NN</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 space-y-1">
                {table.fields.slice(0, 3).map((field, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{field.name}</span>
                    <span className={`${field.primary ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {field.type}
                      {field.primary && ' PK'}
                      {field.autoIncrement && ' AI'}
                    </span>
                  </div>
                ))}
                {table.fields.length > 3 && (
                  <div className="text-gray-500">
                    +{table.fields.length - 3} more fields
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-gray-700 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Database size={16} className="text-green-400" />
          <span className="text-sm font-medium">Schema Statistics</span>
        </div>
        <div className="text-xs text-gray-400 space-y-1">
          <div>Tables: {tables.length}</div>
          <div>Total Fields: {tables.reduce((sum, table) => sum + table.fields, 0)}</div>
          <div>Relationships: {tables.filter(t => t.fields.some(f => f.name.endsWith('_id'))).length}</div>
        </div>
      </div>
    </div>
  );
};