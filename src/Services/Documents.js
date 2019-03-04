//import CurrentDocument from './CurrentDocument'
export default class Documents {
    constructor(name) {
        this.name = name;
        this.localStore = this.validateLocalStore()
    }
    async getDocumentsForUser() {
        return await this.getDocumentsFromLocalStorage()
    }
    setDocumentsForUser(mutatedStore) {
        localStorage[this.name] = JSON.stringify(mutatedStore);
    }
    async getNewDocument() {
        let doc = {
            id: new Date().toISOString(),
            uid: null,
            title: '',
            content: ''
        }
        return await doc
    }
    async saveDocumentToLocalStorage(doc) {
        let docs = await this.getDocumentsForUser();
        let result = "updated"
        let indexOfitemToModify = docs.findIndex(item => {
            return item['id'] === doc.id;
        });
        if(indexOfitemToModify === -1) {
            docs.push(doc);
            result = "created"
        } else {
            docs[indexOfitemToModify] = doc
        }
        this.setDocumentsForUser(docs);
        return result
    }
    async getDocumentsFromLocalStorage() {
        return JSON.parse(
            this.localStore
        );
    }
    async getDocumentsFromRemoteStorage() {

    }
    async getDocumentFromLocalStorage(value, property) {
        let docs = await this.getDocumentsFromLocalStorage();
        let results = docs.filter(item => {
            return  item[property] === value;
        });
        if(results.length > 0) { 
            return results[0] 
        }
        return results;
    }
    validateLocalStore() {
        if (localStorage.getItem(this.name)){
            localStorage[this.name] = localStorage.getItem(this.name);
        } else {
            try {
                localStorage[this.name] = JSON.stringify([]);
            } catch(e) {
                console.log(e)
            }  
        }
        return localStorage[this.name];
    }
}