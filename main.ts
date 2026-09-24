import { Plugin, App, PluginSettingTab, Setting, SettingDefinitionItem } from 'obsidian'

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
				if (title.trim() !== '') {
					const bend = createEl('b')
					bend.textContent = '. '
					bend.classList.add('callout-latex-title')
					titleElement.prepend(bend)
				}

				if (name.trim() !== '') {
					const i = createEl('i')
					i.textContent = ` (${name})`
					i.classList.add('callout-latex-name')
					titleElement.prepend(i)
				}

				if (title.trim() !== '' || name.trim() !== '') {
					const b = createEl('b')
					b.textContent = title
					b.classList.add('callout-latex-title')
					titleElement.prepend(b)
				}
			})

			element
				.findAll('div.callout-content')
				.filter(
					content =>
						(!content.hasChildNodes() && (content.textContent?.trim() ?? '') === '') || //
						(content.childElementCount === 1 && (content.firstElementChild!.textContent?.trim() ?? '') == '' && !content.firstElementChild?.hasChildNodes()),
				)
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

	getSettingDefinitions(): SettingDefinitionItem<string>[] {
		return [
			{
				name: 'Bordered callouts',
				desc: 'Toggle callouts using block borders.',
				control: {
					type: 'toggle',
					key: 'border',
				},
			},
			{
				name: 'Whitelist',
				desc: 'Callout types to be altered by the plugin, one per line. Leave empty to allow all callouts.',
				render: setting => {
					setting.addTextArea(text =>
						text.setValue(this.plugin.settings.whitelist.join('\n')).onChange(async value => {
							this.plugin.settings.whitelist = value
								.split('\n')
								.map(line => line.trim())
								.filter(line => line.length > 0)

							await this.plugin.saveData(this.plugin.settings)
						}),
					)
				},
			},
			{
				name: 'Blacklist',
				desc: 'Callout types to be ignored by the plugin, one per line.',
				render: setting => {
					setting.addTextArea(text =>
						text.setValue(this.plugin.settings.blacklist.join('\n')).onChange(async value => {
							this.plugin.settings.blacklist = value
								.split('\n')
								.map(line => line.trim())
								.filter(line => line.length > 0)

							await this.plugin.saveData(this.plugin.settings)
						}),
					)
				},
			},
		]
	}
}
