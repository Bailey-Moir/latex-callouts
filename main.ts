import { Plugin } from 'obsidian'

const titleRegex = /([^(]*)(?:\(([^)]*)\))?/

export default class LatexCalloutsPlugin extends Plugin {
	process(this: void, element: HTMLElement) {
		const handle = window.setInterval(() => {
			element
				.findAll(`svg.svg-icon`)
				.filter(svg => svg.parentElement?.classList.contains('callout-icon'))
				.forEach(svg => {
					const content = svg.parentElement?.parentElement?.parentElement?.getAttr('data-callout') ?? null
					const titleElement = svg.parentElement?.nextElementSibling ?? null

					if (titleElement === null || content === null || content === 'note') {
						svg.remove()
						return
					}

					const match: (string | undefined)[] | null = titleRegex.exec(content)
					if (match === null) {
						svg.remove()
						return
					}

					const [title, name] = match.slice(1).map(group =>
						group
							?.split('-')
							.map(word => word.charAt(0).toUpperCase() + word.slice(1))
							.join(' '),
					)

					if (titleElement.textContent === content.charAt(0).toUpperCase() + content.replace(/-/g, ' ').slice(1)) titleElement.textContent = ''

					const bend = activeDocument.createElement('b')
					bend.textContent = '. '
					bend.classList.add('callout-latex-title')
					titleElement.prepend(bend)

					if (name !== undefined) {
						const i = activeDocument.createElement('i')
						i.textContent = `(${name})`
						i.classList.add('callout-latex-name')
						titleElement.prepend(i)
					}

					const b = activeDocument.createElement('b')
					b.textContent = title ?? '' // Should be non-null as match is not null
					b.classList.add('callout-latex-title')
					titleElement.prepend(b)

					svg.remove()
				})

			element
				.findAll('div.callout-content')
				.filter(content => content.textContent === null || (content.textContent.trim() === '' && content.childElementCount === 0))
				.forEach(content => content.remove())
		}, 10)
		window.setTimeout(() => window.clearInterval(handle), 10_000)
	}

	onload() {
		this.registerMarkdownPostProcessor(this.process)
		this.app.workspace.on('layout-change', () => this.app.workspace.iterateAllLeaves(leaf => leaf.view.getViewType() === 'markdown' && this.process(leaf.view.containerEl)))
	}
}
