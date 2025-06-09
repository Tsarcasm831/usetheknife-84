import React, { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Link, NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// Check for WebsimSocket, which is still loaded globally via a script tag in index.html
if (typeof WebsimSocket === 'undefined') {
    console.error('Fatal: WebsimSocket library is not loaded. Check CDN link and network in index.html.');
    // Display a user-friendly message directly in the root element if possible
    const rootDiv = document.getElementById('root');
    if (rootDiv) {
        rootDiv.innerHTML = 
          `<div style="padding: 20px; color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: .25rem; font-family: sans-serif;">
             <strong>Application Critical Error</strong><br>
             A core networking library (WebsimSocket) failed to load. This is essential for the application to function.<br>
             Please check your internet connection and refresh the page. If the problem persists, there might be an issue with the service.
           </div>`;
    }
    throw new Error('Fatal: WebsimSocket library is not loaded.'); // Also throw to stop script execution
}

const room = new WebsimSocket();

const App = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await window.websim.getUser();
                setCurrentUser(user);
            } catch (error) {
                console.error("Error fetching user:", error);
            } finally {
                setLoadingUser(false);
            }
        };
        fetchUser();
    }, []);

    if (loadingUser) {
        return <div className="loading">Loading user information...</div>;
    }

    return (
        <HashRouter>
            <Header currentUser={currentUser} />
            <main>
                <Routes>
                    <Route path="/" element={<YourGarden currentUser={currentUser} />} />
                    <Route path="/link-hat" element={<LinkHat currentUser={currentUser} />} />
                    <Route path="/image-corruptor" element={<ImageCorruptor />} />
                    <Route path="/mimic-ai" element={<MimicAI />} />
                    <Route path="/alias/:username/:aliasPath" element={<ViewAlias />} />
                </Routes>
            </main>
        </HashRouter>
    );
};

const Header = ({ currentUser }) => {
    return (
        <header>
            <nav>
                <ul>
                    <li><NavLink to="/" className={({isActive}) => isActive ? 'active' : ''}>Your Garden</NavLink></li>
                    <li><NavLink to="/link-hat" className={({isActive}) => isActive ? 'active' : ''}>Link Hat</NavLink></li>
                    <li><NavLink to="/image-corruptor" className={({isActive}) => isActive ? 'active' : ''}>Image Corruptor</NavLink></li>
                    <li><NavLink to="/mimic-ai" className={({isActive}) => isActive ? 'active' : ''}>Mimic AI</NavLink></li>
                    {currentUser && (
                        <li className="user-info">
                            <img src={`https://images.websim.ai/avatar/${currentUser.username}`} alt={currentUser.username} />
                            <span>@{currentUser.username}</span>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

const YourGarden = ({ currentUser }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const filesPerPage = 5;

    const userFilesFilter = useMemo(() => currentUser ? { username: currentUser.username } : { username: '___NEVER_MATCH___' }, [currentUser]);

    const allFiles = useSyncExternalStore(
        (callback) => room.collection('file_v1').filter(userFilesFilter).subscribe(callback),
        () => room.collection('file_v1').filter(userFilesFilter).getList()
    );
    
    const files = useMemo(() => [...allFiles].reverse(), [allFiles]);


    const paginatedFiles = useMemo(() => {
        const startIndex = (currentPage - 1) * filesPerPage;
        return files.slice(startIndex, startIndex + filesPerPage);
    }, [files, currentPage, filesPerPage]);

    const totalPages = Math.ceil(files.length / filesPerPage);

    const handleFileUpload = async (selectedFilesCollection) => {
        if (!currentUser) {
            setError("You must be logged in to upload files.");
            return;
        }
        if (!selectedFilesCollection || selectedFilesCollection.length === 0) return;
        
        const filesToUpload = Array.from(selectedFilesCollection); // Make sure it's an array

        setUploading(true);
        setError('');
        try {
            for (const file of filesToUpload) {
                const url = await websim.upload(file);
                await room.collection('file_v1').create({
                    fileName: file.name,
                    fileURL: url,
                    fileType: file.type,
                    fileSize: file.size,
                });
            }
        } catch (err) {
            console.error("Upload failed:", err);
            setError(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    };
    const handleFileSelect = (e) => {
        handleFileUpload(e.target.files);
    };

    const handleDeleteFile = async (fileId) => {
        if (!window.confirm("Are you sure you want to delete this file? This cannot be undone.")) return;
        try {
            await room.collection('file_v1').delete(fileId);
        } catch (err) {
            console.error("Delete failed:", err);
            setError(`Delete failed: ${err.message}. You may only delete your own files.`);
        }
    };

    const handleCopyLink = (fileURL) => {
        navigator.clipboard.writeText(fileURL)
            .then(() => alert("Link copied to clipboard!"))
            .catch(err => {
                console.error("Copy failed:", err);
                setError("Failed to copy link.");
            });
    };
    
    if (!currentUser) {
        return <div className="page-container"><p>Please log in to use Your Garden.</p></div>;
    }

    return (
        <div className="page-container">
            <h1>Your Garden</h1>
            <p>Upload and manage your files. Drag and drop files below or use the selector.</p>
            
            {error && <p className="error-message">{error}</p>}
            {uploading && <p className="loading">Uploading...</p>}

            <div 
                className={`drop-zone ${isDragging ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                Drag & Drop files here
                <br /> or <br />
                <input type="file" multiple onChange={handleFileSelect} disabled={uploading} />
            </div>

            <h2>Your Files</h2>
            {files.length === 0 && !uploading && <p>You haven't uploaded any files yet.</p>}
            <ul className="file-list">
                {paginatedFiles.map(file => (
                    <li key={file.id} className="file-item">
                        <div className="file-item-content">
                            <div className="file-info">
                                <strong>{file.fileName}</strong> ({ (file.fileSize / 1024).toFixed(2) } KB)
                                <br />
                                <small>Type: {file.fileType}</small><br/>
                                <small>Uploaded: {new Date(file.created_at).toLocaleString()}</small>
                            </div>
                            <div>
                                <button onClick={() => handleCopyLink(file.fileURL)}>Copy Link</button>
                                <a href={file.fileURL} target="_blank" rel="noopener noreferrer">
                                    <button>View</button>
                                </a>
                                {file.username === currentUser.username && (
                                    <button onClick={() => handleDeleteFile(file.id)} disabled={uploading}>Delete</button>
                                )}
                            </div>
                        </div>
                        {file.fileType && file.fileType.startsWith('image/') && <img src={file.fileURL} alt={file.fileName} className="file-preview" />}
                    </li>
                ))}
            </ul>
            {totalPages > 1 && (
                <div className="pagination">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</button>
                </div>
            )}
        </div>
    );
};

const LinkHat = ({ currentUser }) => {
    const [userFiles, setUserFiles] = useState([]);
    const [selectedFileId, setSelectedFileId] = useState('');
    const [aliasPath, setAliasPath] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const userAliasesFilter = useMemo(() => currentUser ? { username: currentUser.username } : { username: '___NEVER_MATCH___' }, [currentUser]);
    const userFilesFilter = useMemo(() => currentUser ? { username: currentUser.username } : { username: '___NEVER_MATCH___' }, [currentUser]);
    
    const rawAliases = useSyncExternalStore(
        (callback) => room.collection('alias_v1').filter(userAliasesFilter).subscribe(callback),
        () => room.collection('alias_v1').filter(userAliasesFilter).getList()
    );
    const aliases = useMemo(() => 
        [...rawAliases].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [rawAliases]);

    useEffect(() => {
        if (currentUser) {
            const handleFileUpdates = (newFilesList) => {
                const reversedFiles = [...newFilesList].reverse();
                setUserFiles(reversedFiles);

                setSelectedFileId(prevSelectedId => {
                    if (reversedFiles.length > 0) {
                        const selectedStillValid = reversedFiles.some(f => f.id === prevSelectedId);
                        if (selectedStillValid) {
                            return prevSelectedId; 
                        }
                        return reversedFiles[0].id; 
                    }
                    return ''; 
                });
            };

            const initialFiles = room.collection('file_v1').filter(userFilesFilter).getList();
            handleFileUpdates(initialFiles); 

            const unsubscribe = room.collection('file_v1').filter(userFilesFilter).subscribe(handleFileUpdates);
            
            return unsubscribe;
        } else {
            setUserFiles([]);
            setSelectedFileId('');
        }
    }, [currentUser, userFilesFilter]); 

    const generateRandomAlias = () => {
        setAliasPath(uuidv4().substring(0, 8));
    };

    const handleCreateAlias = async (e) => {
        e.preventDefault();
        if (!currentUser || !selectedFileId || !aliasPath.trim()) {
            setError("Please select a file and enter an alias path.");
            return;
        }
        setError('');
        setSuccess('');

        const trimmedAliasPath = aliasPath.trim();
        const existingAlias = room.collection('alias_v1').filter({ username: currentUser.username, aliasPath: trimmedAliasPath }).getList();
        if (existingAlias.length > 0) {
            setError("This alias path is already in use by you. Choose another.");
            return;
        }
        
        const selectedFile = userFiles.find(f => f.id === selectedFileId);
        if (!selectedFile) {
            setError("Selected file not found. It might have been deleted.");
            return;
        }

        try {
            await room.collection('alias_v1').create({
                aliasPath: trimmedAliasPath,
                originalFileId: selectedFileId,
                originalFileURL: selectedFile.fileURL,
                originalFileName: selectedFile.fileName,
                originalFileType: selectedFile.fileType 
            });
            setSuccess(`Alias created: ${window.location.origin}${window.location.pathname}#/alias/${currentUser.username}/${trimmedAliasPath}`);
            setAliasPath(''); 
        } catch (err) {
            console.error("Failed to create alias:", err);
            setError(`Failed to create alias: ${err.message}`);
        }
    };
    
    const handleDeleteAlias = async (aliasId) => {
        if (!window.confirm("Are you sure you want to delete this alias?")) return;
        setError('');
        setSuccess('');
        try {
            await room.collection('alias_v1').delete(aliasId);
            setSuccess("Alias deleted successfully.");
        } catch (err) {
            console.error("Failed to delete alias:", err);
            setError(`Failed to delete alias: ${err.message}`);
        }
    };

    if (!currentUser) {
        return <div className="page-container"><p>Please log in to use the Link Hat.</p></div>;
    }
    
    return (
        <div className="page-container">
            <h1>Link Hat</h1>
            <p>Create custom short links for your files.</p>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="loading" style={{backgroundColor: '#d1e7dd', color: '#0f5132'}}>{success}</p>}

            <form onSubmit={handleCreateAlias}>
                <div className="form-group">
                    <label htmlFor="fileSelect">Select File:</label>
                    <select id="fileSelect" value={selectedFileId} onChange={e => setSelectedFileId(e.target.value)} required disabled={userFiles.length === 0}>
                        <option value="" disabled>{userFiles.length === 0 ? "-- No files available --" : "-- Select a file --"}</option>
                        {userFiles.map(file => (
                            <option key={file.id} value={file.id}>{file.fileName}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="aliasPath">Custom Path:</label>
                    <input 
                        type="text" 
                        id="aliasPath" 
                        value={aliasPath} 
                        onChange={e => setAliasPath(e.target.value.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, ''))} 
                        placeholder="e.g., my-cool-doc (letters, numbers, hyphens only)" 
                        pattern="^[a-zA-Z0-9-]+$"
                        title="Only letters, numbers, and hyphens are allowed."
                        required 
                    />
                    <button type="button" onClick={generateRandomAlias} style={{marginTop: '0.5rem', marginBottom: '1rem'}}>Generate Random</button>
                </div>
                <button type="submit" disabled={!selectedFileId || !aliasPath.trim()}>Create Alias</button>
            </form>

            <h2>Your Aliases</h2>
            {aliases.length === 0 && <p>You haven't created any aliases yet.</p>}
            <ul className="alias-list">
                {aliases.map(alias => (
                    <li key={alias.id} className="alias-item">
                        <div style={{flexGrow: 1, wordBreak: 'break-all'}}>
                            <strong>Alias:</strong> <Link to={`/alias/${alias.username}/${alias.aliasPath}`}>{`/alias/${alias.username}/${alias.aliasPath}`}</Link>
                            <br />
                            <strong>Original:</strong> {alias.originalFileName || 'N/A'} ({alias.originalFileType || 'unknown type'})
                             <br/>
                             <small>Points to: <a href={alias.originalFileURL} target="_blank" rel="noopener noreferrer">{alias.originalFileURL.length > 50 ? alias.originalFileURL.substring(0,50) + '...' : alias.originalFileURL}</a></small>
                        </div>
                        <button onClick={() => handleDeleteAlias(alias.id)} style={{marginTop: '0.5rem'}}>Delete Alias</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ViewAlias = () => {
    const { username, aliasPath } = useParams();
    const [aliasInfo, setAliasInfo] = useState(null); 
    const [fileInfo, setFileInfo] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        setAliasInfo(null);
        setFileInfo(null);

        const aliasFilterParams = { username, aliasPath };

        const updateStateWithAliasData = (currentAlias) => {
            if (currentAlias) {
                setAliasInfo(currentAlias);
                // File fetching will be triggered by aliasInfo update in the other subscription or a separate effect
            } else {
                setError("Alias not found.");
                setAliasInfo(null); 
                setFileInfo(null);
            }
            // Tentatively set loading to false; file fetching might set it true again or also resolve
            // This logic can be tricky; consider a state machine or more granular loading flags
            setLoading(false); 
        };
        
        const checkAliasAndFile = () => { // Renamed for clarity, as it mainly checks alias now
            const matchingAliases = room.collection('alias_v1').filter(aliasFilterParams).getList();
            updateStateWithAliasData(matchingAliases[0] || null);
        };

        const unsubscribeAlias = room.collection('alias_v1').filter(aliasFilterParams).subscribe((aliases) => {
            const currentAlias = aliases[0] || null;
            setAliasInfo(currentAlias); // Update aliasInfo state
            if (!currentAlias) {
                setError("Alias not found.");
                setFileInfo(null); // Clear file info if alias disappears
                setLoading(false); // Alias resolved to not found
            }
            // If currentAlias is set, the other effect/subscription for file will take over
        });
        
        // Initial check for alias
        checkAliasAndFile();


        // This part is for fetching file based on aliasInfo. It should ideally be in its own useEffect triggered by aliasInfo.
        // For now, keeping the original structure but noting the stale closure risk for aliasInfo inside file subscription.
        // A proper fix would involve separating these effects or using useSyncExternalStore for both.
        const unsubscribeFile = room.collection('file_v1').subscribe(() => {
            // This callback uses `aliasInfo` from the closure of this `useEffect`.
            // If `aliasInfo` state changes, this callback doesn't get the new `aliasInfo` unless the effect re-runs.
            // The current `useEffect` deps `[username, aliasPath]` don't include `aliasInfo`.
            // This is a potential source of bugs (stale data) but not necessarily a "Script error."
            const currentAliasInfo = room.collection('alias_v1').filter(aliasFilterParams).getList()[0]; // Re-fetch to get latest

            if (currentAliasInfo && currentAliasInfo.originalFileId) { 
                 const originalFileRecords = room.collection('file_v1').filter({ id: currentAliasInfo.originalFileId }).getList();
                 if (originalFileRecords.length > 0) {
                    setFileInfo(originalFileRecords[0]);
                } else {
                     setFileInfo({ 
                        fileName: currentAliasInfo.originalFileName || 'File (original record missing)',
                        fileURL: currentAliasInfo.originalFileURL,
                        fileType: currentAliasInfo.originalFileType || '', 
                    });
                }
                setLoading(false); // File loaded or fallback used
            } else if (currentAliasInfo) { // Alias exists but no file ID
                 setFileInfo({ 
                    fileName: currentAliasInfo.originalFileName || 'File (details missing)',
                    fileURL: currentAliasInfo.originalFileURL,
                    fileType: currentAliasInfo.originalFileType || '', 
                });
                setLoading(false); // Fallback used as no file ID
            }
            // If no currentAliasInfo, alias subscription should have handled error/loading.
        });
        

        return () => {
            unsubscribeAlias();
            unsubscribeFile();
        };
    }, [username, aliasPath]); // `aliasInfo` is not in deps to avoid loop. Stale closure risk mentioned above.

    if (loading) return <div className="page-container loading">Loading alias...</div>;
    if (error) return <div className="page-container error-message">{error}</div>;
    if (!aliasInfo || !fileInfo) return <div className="page-container error-message">File information not available for this alias. It may have been deleted or the link is incorrect.</div>;
    
    return (
        <div className="page-container">
            <h1>Viewing Alias: {aliasInfo.aliasPath}</h1>
            <p>by @{aliasInfo.username}</p>
            <p>This alias points to the file: <strong>{fileInfo.fileName}</strong> ({fileInfo.fileType || 'unknown type'})</p>
            
            {fileInfo.fileType && fileInfo.fileType.startsWith('image/') && (
                <img src={fileInfo.fileURL} alt={fileInfo.fileName} style={{maxWidth: '100%', maxHeight: '400px', margin: '1rem 0', border: '1px solid #eee'}} />
            )}
            {fileInfo.fileType && fileInfo.fileType.startsWith('video/') && (
                <video controls src={fileInfo.fileURL} style={{maxWidth: '100%', maxHeight: '400px', margin: '1rem 0', border: '1px solid #eee'}}>Your browser does not support the video tag.</video>
            )}
            {fileInfo.fileType && fileInfo.fileType.startsWith('audio/') && (
                <audio controls src={fileInfo.fileURL} style={{width: '100%', margin: '1rem 0'}}>Your browser does not support the audio element.</audio>
            )}

            <p><a href={fileInfo.fileURL} target="_blank" rel="noopener noreferrer"><button>Open Original File</button></a></p>
        </div>
    );
};

const ImageCorruptor = () => {
    const [originalImage, setOriginalImage] = useState(null); 
    const [originalImageDataURL, setOriginalImageDataURL] = useState(''); 
    const [corruptedImage, setCorruptedImage] = useState(null); 
    const [imageUrlInput, setImageUrlInput] = useState(''); 
    const [corruptionLevel, setCorruptionLevel] = useState(10); 
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleImageLoad = (src) => {
        setIsLoading(true);
        setError('');
        setOriginalImage(null);
        setOriginalImageDataURL('');
        setCorruptedImage(null);

        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        img.onload = () => {
            setOriginalImage(img); 
            setOriginalImageDataURL(src); 
            setIsLoading(false);
        };
        img.onerror = () => {
            setError("Failed to load image. Check URL or try another image. If using an external URL, ensure its server allows cross-origin access (CORS).");
            setIsLoading(false);
        };
        img.src = src;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                handleImageLoad(event.target.result); 
            };
            reader.onerror = () => {
                setError('Failed to read file.');
                setIsLoading(false);
            }
            reader.readAsDataURL(file);
        }
    };

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (imageUrlInput) {
            handleImageLoad(imageUrlInput);
        } else {
            setError("Please enter an image URL.");
        }
    };

    const corruptImage = () => {
        if (!originalImage) {
            setError("No image loaded to corrupt.");
            return;
        }
        setError('');
        setIsLoading(true);
        setCorruptedImage(null); // Clear previous result

        setTimeout(() => { // setTimeout to allow UI update for isLoading
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { willReadFrequently: true }); 
                
                if (originalImage.naturalWidth === 0 || originalImage.naturalHeight === 0) {
                    setError("Image has zero dimensions (e.g., empty or invalid image file) and cannot be processed.");
                    setCorruptedImage(null);
                    setIsLoading(false);
                    return;
                }

                canvas.width = originalImage.naturalWidth; 
                canvas.height = originalImage.naturalHeight;
                
                ctx.drawImage(originalImage, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const level = corruptionLevel / 100;

                for (let i = 0; i < data.length; i += 4) {
                    if (Math.random() < (0.1 * level + 0.01)) { 
                        data[i] = data[i] ^ Math.floor(Math.random() * 255 * level); 
                        data[i+1] = data[i+1] + Math.floor((Math.random() - 0.5) * 150 * level); 
                        data[i+2] = (data[i+2] + Math.floor(Math.random() * 50 * level)) % 256; 
                    }
                }
                ctx.putImageData(imageData, 0, 0); 
                
                for (let y = 0; y < canvas.height; y++) {
                    if (Math.random() < (0.05 * level)) { 
                        const shift = Math.floor((Math.random() - 0.5) * canvas.width * 0.1 * level);
                        const rowImageData = ctx.getImageData(0, y, canvas.width, 1);
                        ctx.clearRect(0, y, canvas.width, 1); 
                        ctx.putImageData(rowImageData, shift, y);
                    }
                }
                setCorruptedImage(canvas.toDataURL('image/png'));
            } catch(e) {
                console.error("Corruption error:", e);
                setError("Could not corrupt image. This sometimes happens with external images due to security restrictions (CORS), or if the image format is unsupported by the browser's canvas. Try uploading the image directly or using a different image URL/format.");
                setCorruptedImage(null); 
            } finally {
                setIsLoading(false);
            }
        }, 10); 
    };
    
    const downloadImage = () => {
        if (!corruptedImage) return;
        const link = document.createElement('a');
        link.href = corruptedImage;
        link.download = 'corrupted-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="page-container">
            <h1>Image Corruptor</h1>
            <p>Upload an image or provide a URL to apply glitch effects. Results may vary!</p>
            {error && <p className="error-message">{error}</p>}
            {isLoading && <p className="loading">Processing image...</p>}

            <form onSubmit={handleUrlSubmit} className="form-group">
                <label htmlFor="imageUrlInput">Image URL:</label>
                <input type="text" id="imageUrlInput" value={imageUrlInput} onChange={e => setImageUrlInput(e.target.value)} placeholder="https://example.com/image.jpg" />
                <button type="submit" disabled={isLoading}>Load from URL</button>
            </form>
            <div className="form-group">
                <label htmlFor="imageFile">Or Upload Image:</label>
                <input type="file" id="imageFile" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
            </div>

            {originalImage && (
                <>
                    <div className="form-group">
                        <label htmlFor="corruptionLevel">Corruption Level (1-100): {corruptionLevel}</label>
                        <input type="range" id="corruptionLevel" min="1" max="100" value={corruptionLevel} onChange={e => setCorruptionLevel(parseInt(e.target.value))} style={{width: '100%'}}/>
                    </div>
                    <button onClick={corruptImage} disabled={isLoading || !originalImage}>Corrupt Image</button>
                </>
            )}
            
            <div className="image-corruptor-container" style={{marginTop: '1rem'}}>
                {originalImageDataURL && ( 
                    <div>
                        <h2>Original</h2>
                        <img src={originalImageDataURL} alt="Original" style={{maxWidth: '100%', width:'auto', maxHeight: '300px', border: '1px solid #ccc', objectFit: 'contain'}} />
                    </div>
                )}
                {corruptedImage && (
                    <div>
                        <h2>Corrupted</h2>
                        <img src={corruptedImage} alt="Corrupted" style={{maxWidth: '100%', width:'auto', maxHeight: '300px', border: '1px solid #ccc', objectFit: 'contain'}} />
                        <br/>
                        <button onClick={downloadImage} style={{marginTop: '0.5rem'}}>Download Corrupted Image</button>
                    </div>
                )}
            </div>
             {originalImage && !corruptedImage && !isLoading && <p style={{marginTop: '1rem'}}>Image loaded. Adjust corruption level and click "Corrupt Image".</p>}
        </div>
    );
};

const MimicAI = () => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const mimicText = async () => {
        if (!inputText.trim()) {
            setOutputText('');
            return;
        }
        setIsLoading(true);
        setOutputText(''); 

        try {
            const conversationHistory = [{
                role: "system",
                content: "You are a slightly eccentric and verbose mimic. Rephrase the user's text in a playful, quirky, and slightly old-fashioned way. Use interesting vocabulary but keep the core meaning. Don't be a direct chatbot, just mimic the style. Respond with only the mimicked text."
            }, {
                role: "user",
                content: inputText
            }];

            const completion = await websim.chat.completions.create({
                messages: conversationHistory,
            });
            
            setOutputText(completion.content);

        } catch (error) {
            console.error("Mimic AI LLM call failed:", error);
            setOutputText("Oh dear, my circuits are a bit scrambled. I couldn't quite mimic that. Try again perhaps?");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h1>Mimic AI</h1>
            <p>Enter some text and let our (not-so-advanced) AI mimic it in its own peculiar style.</p>
            <div className="form-group">
                <label htmlFor="inputText">Your Text:</label>
                <textarea 
                    id="inputText" 
                    value={inputText} 
                    onChange={e => setInputText(e.target.value)} 
                    rows="4"
                    placeholder="Type something here..."
                />
            </div>
            <button onClick={mimicText} disabled={isLoading || !inputText.trim()}>
                {isLoading ? 'Mimicking...' : 'Mimic!'}
            </button>
            {outputText && (
                <div style={{marginTop: '1rem'}}>
                    <h2>Mimicked Output:</h2>
                    <p style={{border: '1px solid #eee', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '4px', whiteSpace: 'pre-wrap'}}>{outputText}</p>
                </div>
            )}
        </div>
    );
};

const rootElement = document.getElementById('root');
if (rootElement) {
    // Use ReactDOM from the import
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
} else {
    console.error('Fatal: Root element with ID "root" not found in the DOM.');
    // Attempt to inform the user even if #root is missing, though this is a severe structural issue.
    document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: sans-serif;"><strong>Critical Error:</strong> Application mount point (#root) is missing from the page structure.</div>';
}