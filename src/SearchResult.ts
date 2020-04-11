import * as vscode from 'vscode';
import BlockInfo from './BlockInfo';

export default class SearchResult {
    uri: vscode.Uri;
    blockInfo: BlockInfo;
    constructor(uri: vscode.Uri, blockInfo: BlockInfo) {
        this.uri = uri;
        this.blockInfo = blockInfo;
    }    
}
