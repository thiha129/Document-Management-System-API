/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("tslib");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("express");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("cors");

/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("http");

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = __webpack_require__(2);
const document_route_1 = tslib_1.__importDefault(__webpack_require__(6));
const folder_route_1 = tslib_1.__importDefault(__webpack_require__(12));
const history_route_1 = tslib_1.__importDefault(__webpack_require__(16));
const search_route_1 = tslib_1.__importDefault(__webpack_require__(20));
const router = (0, express_1.Router)();
router.use('/folders', folder_route_1.default);
router.use('/documents', document_route_1.default);
router.use('/history', history_route_1.default);
router.use('/search', search_route_1.default);
exports["default"] = router;


/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const document_controller_1 = __webpack_require__(7);
const router = express_1.default.Router();
router.get('/:id', document_controller_1.getDocument);
router.post('/', document_controller_1.addDocument);
router.delete('/:id', document_controller_1.deleteDocument);
router.patch('/:id', document_controller_1.updateDocument);
exports["default"] = router;


/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateDocument = exports.deleteDocument = exports.addDocument = exports.getDocument = void 0;
const document_service_1 = __webpack_require__(8);
const getDocument = (req, res) => {
    const doc = document_service_1.DocumentService.getDocument(req.params.id);
    return doc
        ? res.json(doc)
        : res.status(404).json({ error: 'Document not found' });
};
exports.getDocument = getDocument;
const addDocument = (req, res) => {
    const { title, content, folderId } = req.body;
    if (!title || !content || !folderId) {
        return res
            .status(400)
            .json({ error: 'Title, content, and folderId are required' });
    }
    const newDoc = document_service_1.DocumentService.addDocument(title, content, folderId);
    if (!newDoc) {
        return res.status(400).json({ error: 'Folder not found' });
    }
    return res.json(newDoc);
};
exports.addDocument = addDocument;
const deleteDocument = (req, res) => {
    const success = document_service_1.DocumentService.deleteDocument(req.params.id);
    return success
        ? res.json({ status: 'deleted' })
        : res.status(404).json({ error: 'Document not found' });
};
exports.deleteDocument = deleteDocument;
const updateDocument = (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'Invalid document ID' });
    }
    if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content is required' });
    }
    const updatedDocument = document_service_1.DocumentService.updateDocument(id, content);
    if (!updatedDocument) {
        return res.status(404).json({ error: 'Document not found' });
    }
    return res.json(updatedDocument);
};
exports.updateDocument = updateDocument;


/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentService = void 0;
const document_repository_1 = __webpack_require__(9);
exports.DocumentService = {
    getDocument: (id) => document_repository_1.DocumentRepository.getDocument(id),
    addDocument: (title, content, folderId) => document_repository_1.DocumentRepository.addDocument(title, content, folderId),
    deleteDocument: (id) => document_repository_1.DocumentRepository.deleteDocument(id),
    updateDocument: (id, content) => {
        return document_repository_1.DocumentRepository.updateDocument(id, content);
    },
};


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DocumentRepository = void 0;
const uuid_1 = __webpack_require__(10);
const mockDatabase_1 = __webpack_require__(11);
exports.DocumentRepository = {
    getDocument: (id) => mockDatabase_1.documentBase.documents.find((doc) => doc.id === id) || null,
    addDocument: (title, content, folderId) => {
        const folderExists = mockDatabase_1.documentBase.folders.some((folder) => folder.id === folderId);
        if (!folderExists) {
            return null;
        }
        const id = (0, uuid_1.v4)();
        const newDocument = {
            id,
            title,
            content,
            folderId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        mockDatabase_1.documentBase.documents.push(newDocument);
        return newDocument;
    },
    deleteDocument: (id) => {
        const index = mockDatabase_1.documentBase.documents.findIndex((doc) => doc.id === id);
        if (index === -1)
            return false;
        mockDatabase_1.documentBase.documents.splice(index, 1);
        return true;
    },
    updateDocument: (id, content) => {
        if (!id || typeof id !== 'string')
            return null;
        if (!content || typeof content !== 'string')
            return null;
        const index = mockDatabase_1.documentBase.documents.findIndex((doc) => doc.id === id);
        if (index === -1)
            return null;
        if (mockDatabase_1.documentBase.documents[index].content === content) {
            return mockDatabase_1.documentBase.documents[index];
        }
        mockDatabase_1.documentBase.documents[index] = {
            ...mockDatabase_1.documentBase.documents[index],
            content,
            updatedAt: Date.now(),
        };
        return mockDatabase_1.documentBase.documents[index];
    },
};


/***/ }),
/* 10 */
/***/ ((module) => {

module.exports = require("uuid");

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.documentBase = void 0;
exports.documentBase = {
    folders: [
        { id: 'javascript', name: 'JavaScript', type: 'folder' },
        { id: 'devops', name: 'DevOps', type: 'folder' },
    ],
    documents: [
        {
            id: 'js-basics',
            folderId: 'javascript',
            title: 'JavaScript Basics',
            content: `# JavaScript Basics\n\n## Variables\n\`\`\`javascript\nlet name = "Alice";\`\`\``,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
        {
            id: 'docker-basics',
            folderId: 'devops',
            title: 'Docker Basics',
            content: `# Docker Basics\n\n## Install Docker\nFollow the [Docker guide](https://docs.docker.com/).`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        },
    ],
    history: [],
};


/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const folder_controller_1 = __webpack_require__(13);
const router = express_1.default.Router();
router.get('/', folder_controller_1.getFolders);
router.get('/:id', folder_controller_1.getDocumentsByFolder);
router.post('/', folder_controller_1.addFolder);
router.delete('/:id', folder_controller_1.deleteFolder);
exports["default"] = router;


/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deleteFolder = exports.addFolder = exports.getDocumentsByFolder = exports.getFolders = void 0;
const folder_service_1 = __webpack_require__(14);
const getFolders = (req, res) => res.json(folder_service_1.FolderService.getFolders());
exports.getFolders = getFolders;
const getDocumentsByFolder = (req, res) => res.json(folder_service_1.FolderService.getDocumentsByFolder(req.params.id));
exports.getDocumentsByFolder = getDocumentsByFolder;
const addFolder = (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Folder name is required' });
    }
    const folderExists = folder_service_1.FolderService.getFolders().some((folder) => folder.name.toLowerCase() === name.toLowerCase());
    if (folderExists) {
        return res.status(400).json({ error: 'Folder already exists' });
    }
    const newFolder = folder_service_1.FolderService.addFolder(name);
    return res.json(newFolder);
};
exports.addFolder = addFolder;
const deleteFolder = (req, res) => {
    const success = folder_service_1.FolderService.deleteFolder(req.params.id);
    return success
        ? res.json({ status: 'deleted' })
        : res.status(404).json({ error: 'Folder not found' });
};
exports.deleteFolder = deleteFolder;


/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FolderService = void 0;
const folder_repository_1 = __webpack_require__(15);
exports.FolderService = {
    getFolders: () => folder_repository_1.FolderRepository.getFolders(),
    getDocumentsByFolder: (folderId) => folder_repository_1.FolderRepository.getDocumentsByFolder(folderId),
    addFolder: (name) => folder_repository_1.FolderRepository.addFolder(name),
    deleteFolder: (id) => folder_repository_1.FolderRepository.deleteFolder(id),
};


/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FolderRepository = void 0;
const mockDatabase_1 = __webpack_require__(11);
const uuid_1 = __webpack_require__(10);
exports.FolderRepository = {
    getFolders: () => mockDatabase_1.documentBase.folders,
    getDocumentsByFolder: (folderId) => {
        return mockDatabase_1.documentBase.documents.filter((doc) => doc.folderId === folderId);
    },
    addFolder: (name) => {
        const newFolder = {
            id: (0, uuid_1.v4)(),
            name,
            type: 'folder',
        };
        mockDatabase_1.documentBase.folders.push(newFolder);
        return newFolder;
    },
    deleteFolder: (id) => {
        const folderIndex = mockDatabase_1.documentBase.folders.findIndex((folder) => folder.id === id);
        if (folderIndex === -1)
            return false;
        mockDatabase_1.documentBase.documents = mockDatabase_1.documentBase.documents.filter((doc) => doc.folderId !== id);
        mockDatabase_1.documentBase.folders.splice(folderIndex, 1);
        return true;
    },
};


/***/ }),
/* 16 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const history_controller_1 = __webpack_require__(17);
const router = express_1.default.Router();
router.get('/', history_controller_1.getHistory);
router.post('/', history_controller_1.addHistory);
exports["default"] = router;


/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addHistory = exports.getHistory = void 0;
const history_service_1 = __webpack_require__(18);
const getHistory = (req, res) => res.json(history_service_1.HistoryService.getHistory());
exports.getHistory = getHistory;
const addHistory = (req, res) => {
    history_service_1.HistoryService.addHistory(req.body);
    res.json({ status: 'added' });
};
exports.addHistory = addHistory;


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HistoryService = void 0;
const history_repository_1 = __webpack_require__(19);
exports.HistoryService = {
    getHistory: () => history_repository_1.HistoryRepository.getHistory(),
    addHistory: (entry) => history_repository_1.HistoryRepository.addHistory(entry),
};


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.HistoryRepository = void 0;
const mockDatabase_1 = __webpack_require__(11);
exports.HistoryRepository = {
    getHistory: () => mockDatabase_1.documentBase.history,
    addHistory: (entry) => {
        const newEntry = { ...entry, timestamp: Date.now() };
        mockDatabase_1.documentBase.history.unshift(newEntry);
        mockDatabase_1.documentBase.history = mockDatabase_1.documentBase.history.slice(0, 10);
        return newEntry;
    },
};


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const search_controller_1 = __webpack_require__(21);
const router = express_1.default.Router();
router.get('/', search_controller_1.search);
exports["default"] = router;


/***/ }),
/* 21 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.search = void 0;
const search_service_1 = __webpack_require__(22);
const search = (req, res) => res.json(search_service_1.SearchService.search(req.query.query));
exports.search = search;


/***/ }),
/* 22 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchService = void 0;
const search_repository_1 = __webpack_require__(23);
exports.SearchService = {
    search: (query) => search_repository_1.SearchRepository.search(query),
};


/***/ }),
/* 23 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SearchRepository = void 0;
const mockDatabase_1 = __webpack_require__(11);
exports.SearchRepository = {
    search: (query) => mockDatabase_1.documentBase.documents
        .filter((doc) => doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.content.toLowerCase().includes(query.toLowerCase()))
        .map((doc) => ({
        id: doc.id,
        title: doc.title,
        snippet: doc.content.slice(0, 100) + '...',
    })),
};


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const tslib_1 = __webpack_require__(1);
const express_1 = tslib_1.__importDefault(__webpack_require__(2));
const cors_1 = tslib_1.__importDefault(__webpack_require__(3));
const http_1 = __webpack_require__(4);
const routes_1 = tslib_1.__importDefault(__webpack_require__(5));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api', routes_1.default);
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

})();

/******/ })()
;