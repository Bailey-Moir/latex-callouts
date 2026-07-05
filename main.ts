import { Plugin, App, PluginSettingTab, Setting } from 'obsidian'

const titleRegex = /([^(]*)(?:\(([^)]*)\))?$/

interface LatexCalloutsSettings {
	border: boolean
	whitelist: string[]
	blacklist: string[]
}

const DEFAULT_SETTINGS: LatexCalloutsSettings = {
	border: false,
	whitelist: [],
	blacklist: [],
}

export default class LatexCalloutsPlugin extends Plugin {
	settings: LatexCalloutsSettings

	process = (element: HTMLElement) => {
		const handle = window.setInterval(() => {
			element.findAll('div.callout').forEach(callout => {
				callout.find('div.callout-icon svg.svg-icon')?.remove()

				const content = callout.getAttr('data-callout')
				if (content === null) return

				const match: (string | undefined)[] | null = titleRegex.exec(content)
				if (match === null) return
				const [title, name] = match
					.slice(1)
					.map(group =>
						group
							?.split('-')
							.map(word => word.charAt(0).toUpperCase() + word.slice(1))
							.join(' '),
					)
					.map(word => word?.trim() ?? '')

				// Blacklist and whitelist
				if ((this.settings.whitelist.length != 0 && !this.settings.whitelist.includes(title.toLowerCase())) || this.settings.blacklist.includes(title.toLowerCase())) return

				callout.addClass('callout-latex')

				// Bordered
				callout.classList.toggle('callout-bordered', this.settings.border)

				const titleElement = callout.find('div.callout-title-inner') ?? null
				if (titleElement === null) return
				if (titleElement.textContent === content.charAt(0).toUpperCase() + content.replace(/-/g, ' ').slice(1)) titleElement.textContent = ''

				if (titleElement.querySelector('.callout-latex-title, .callout-latex-name')) return

				// Create HTML
				if (title.trim().length !== 0) {
					const bend = activeDocument.createElement('b')
					bend.textContent = '. '
					bend.classList.add('callout-latex-title')
					titleElement.prepend(bend)
				}

				if (name.trim().length !== 0) {
					const i = activeDocument.createElement('i')
					i.textContent = ` (${name})`
					i.classList.add('callout-latex-name')
					titleElement.prepend(i)
				}

				if (title.trim().length !== 0) {
					const b = activeDocument.createElement('b')
					b.textContent = title
					b.classList.add('callout-latex-title')
					titleElement.prepend(b)
				}
			})

			element
				.findAll('div.callout-content')
				.filter(content => content.textContent === null || (content.textContent.trim().length === 0 && content.childElementCount === 0))
				.forEach(content => content.remove())
		}, 50)

		window.setTimeout(() => window.clearInterval(handle), 10_000)
	}

	async saveSettings() {
		await this.saveData(this.settings)
	}

	async onload() {
		this.registerMarkdownPostProcessor(this.process)
		this.registerEvent(this.app.workspace.on('layout-change', () => this.app.workspace.iterateAllLeaves(leaf => leaf.view.getViewType() === 'markdown' && this.process(leaf.view.containerEl))))

		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
		this.addSettingTab(new LatexCalloutsSettingTab(this.app, this))
	}
}

class LatexCalloutsSettingTab extends PluginSettingTab {
	plugin: LatexCalloutsPlugin

	constructor(app: App, plugin: LatexCalloutsPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		new Setting(containerEl)
			.setName('Bordered callouts')
			.setDesc('Toggle callouts using block borders.')
			.addToggle(toggle =>
				toggle.setValue(this.plugin.settings.border).onChange(async value => {
					this.plugin.settings.border = value
					await this.plugin.saveSettings()
				}),
			)

		new Setting(containerEl)
			.setName('Whitelist')
			.setDesc('Callout types to be altered by the plugin, one per line. Leave empty to allow all callouts.')
			.addTextArea(text =>
				text.setValue(this.plugin.settings.whitelist.join('\n')).onChange(async value => {
					this.plugin.settings.whitelist = value
						.split('\n')
						.map(line => line.trim())
						.filter(line => line.length > 0)
					await this.plugin.saveSettings()
				}),
			)

		new Setting(containerEl)
			.setName('Blacklist')
			.setDesc('Callout types to be ignored by the plugin, one per line.')
			.addTextArea(text =>
				text.setValue(this.plugin.settings.blacklist.join('\n')).onChange(async value => {
					this.plugin.settings.blacklist = value
						.split('\n')
						.map(line => line.trim())
						.filter(line => line.length > 0)
					await this.plugin.saveSettings()
				}),
			)
	}
}
