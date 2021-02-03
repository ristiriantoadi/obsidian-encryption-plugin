import { App, Modal, Plugin,TextComponent,ButtonComponent,MarkdownView,Notice } from 'obsidian';
import aes from 'crypto-js/aes';
import CryptoJS from "crypto-js/core";

export default class MyPlugin extends Plugin {
	async onload() {
		console.log('loading plugin');

		this.addRibbonIcon('dice', 'Encryption', () => {
			new EncryptionModal(this.app).open()
		});

		this.addRibbonIcon('dice', 'Decryption', () => {
			new DecryptionModal(this.app).open()
		});
	}

	onunload() {
		console.log('unloading plugin');
	}
}

class EncryptionModal extends Modal{
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const currentView = this.app.workspace.activeLeaf.view as MarkdownView;
		const currentFile = currentView.file
		const filename=currentFile.name
		let {titleEl,contentEl} = this;
		titleEl.setText(`Encrypt: ${filename}`);
		contentEl.addClass("encryption")
		const inputKey = new TextComponent(contentEl).setPlaceholder("Enter key ... ")
		inputKey.inputEl.type="password"
		const confirmKey = new TextComponent(contentEl).setPlaceholder("Confirm key ... ")
		confirmKey.inputEl.type="password"
		new ButtonComponent(contentEl).setButtonText("Encrypt").onClick(()=>{
			if(inputKey.getValue().length <8){
				new Notice('8 characters minimum!')
				return
			}
			if(inputKey.getValue() !== confirmKey.getValue()){
				new Notice('confirmation key wrong!');
				return;
			}
			this.app.vault.read(currentFile).then(text=>{
				 const key = inputKey.getValue()
				 const encrypted = aes.encrypt(text, key);
				 return this.app.vault.modify(currentFile,encrypted.toString())
			})
			.then(()=>{
				this.close()
			})
		})
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}

}

class DecryptionModal extends Modal{
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const currentView = this.app.workspace.activeLeaf.view as MarkdownView;
		const currentFile = currentView.file
		const filename=currentFile.name
		let {titleEl,contentEl} = this;
		titleEl.setText(`Decrypt: ${filename}`);
		contentEl.addClass("encryption")
		const inputKey = new TextComponent(contentEl).setPlaceholder("Enter key ... ")
		inputKey.inputEl.type="password"
		new ButtonComponent(contentEl).setButtonText("Decrypt").onClick(()=>{
			this.app.vault.read(currentFile).then(text=>{
				var decrypted = aes.decrypt(text, inputKey.getValue()).toString(CryptoJS.enc.Utf8);
				return this.app.vault.modify(currentFile,decrypted)
			})
			.then(()=>{
				this.close()
			})
			.catch(err=>{
				new Notice("Wrong key")
				console.log(err)
			})
		})
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}

}
