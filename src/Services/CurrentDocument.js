export default class CurrentDocument {
    constructor(doc) {
        this.id = doc.id
        this.uid = doc.uid
        this.title = doc.title
        this.content = doc.content
    }
}