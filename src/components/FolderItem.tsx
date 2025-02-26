import React from 'react';
import { Folder, TestCase } from '../types';
import { Trash2, Edit2, FolderPlus, Folder as FolderIcon, Copy } from 'lucide-react';

interface FolderItemProps {
  folder: Folder;
  testCases: TestCase[];
  folders: Folder[];
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAddSubfolder: (parentId: string) => void;
  onTestMove: (testId: string, folderId?: string) => void;
  onTestSelect: (id: string) => void;
  onTestEdit: (test: TestCase) => void;
  onTestDuplicate: (test: TestCase) => void;
  onTestDelete: (id: string) => void;
  currentTestId: string | null;
  level?: number;
}

export const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  testCases,
  folders,
  onRename,
  onDelete,
  onAddSubfolder,
  onTestMove,
  onTestSelect,
  onTestEdit,
  onTestDuplicate,
  onTestDelete,
  currentTestId,
  level = 0,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [name, setName] = React.useState(folder.name);
  const [isOpen, setIsOpen] = React.useState(true);

  const handleRename = () => {
    onRename(folder.id, name);
    setIsEditing(false);
  };

  const handleAddSubfolder = () => {
    onAddSubfolder(folder.id);
  };

  const nestedFolders = folders.filter(f => f.parentId === folder.id);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const testId = e.dataTransfer.getData('text/plain');
    onTestMove(testId, folder.id);
  };

  return (
    <div className={`ml-${level * 4} mt-2`}>
      <div
        className={`flex items-center justify-between p-3 rounded-lg border ${
          currentTestId === folder.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center space-x-2 flex-1">
          <FolderIcon className="w-5 h-5 text-yellow-500" />
          {isEditing ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
              }}
              className="flex-1 bg-transparent border-b-2 border-blue-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <button onClick={() => setIsOpen(!isOpen)} className="flex-1 text-left">
              {folder.name}
            </button>
          )}
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-500" title="Rename folder">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={handleAddSubfolder} className="text-gray-400 hover:text-green-500" title="Add Subfolder">
            <FolderPlus className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(folder.id)} className="text-gray-400 hover:text-red-500" title="Delete folder">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="ml-4 mt-2">
          {testCases
            .filter(tc => tc.folderId === folder.id)
            .map(tc => (
              <div
                key={tc.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  currentTestId === tc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', tc.id)}
              >
                <button className="flex-1 text-left" onClick={() => onTestSelect(tc.id)}>
                  {tc.name}
                </button>
                <div className="flex space-x-2">
                  <button onClick={() => onTestDuplicate(tc)} className="text-gray-400 hover:text-blue-500" title="Duplicate test case">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => onTestEdit(tc)} className="text-gray-400 hover:text-blue-500" title="Edit test case">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onTestDelete(tc.id)} className="text-gray-400 hover:text-red-500" title="Delete test case">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          {nestedFolders.map(subfolder => (
            <FolderItem
              key={subfolder.id}
              folder={subfolder}
              testCases={testCases}
              folders={folders}
              onRename={onRename}
              onDelete={onDelete}
              onAddSubfolder={onAddSubfolder}
              onTestMove={onTestMove}
              onTestSelect={onTestSelect}
              onTestEdit={onTestEdit}
              onTestDuplicate={onTestDuplicate}
              onTestDelete={onTestDelete}
              currentTestId={currentTestId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
