import { Plugin } from 'obsidian'

const titleRegex = /([^(]*)\(([^)]*)\)?/

export default class LatexCalloutsPlugin extends Plugin {
	process(element: HTMLElement) {
		const handle = setInterval(
			() =>
				element
					.findAll(`svg.svg-icon`)
					.filter(svg => svg.parentElement?.classList.contains('callout-icon'))
					.forEach(svg => {
						const content = svg.parentElement?.parentElement?.parentElement?.getAttr('data-callout')!
						const match: (string | undefined)[] | null = titleRegex.exec(content)
						if (content !== 'note' && match !== null) {
							const [title, name] = match.slice(1).map(group =>
								group
									?.split('-')
									.map(word => word.charAt(0).toUpperCase() + word.slice(1))
									.join(' '),
							)

							const titleElement = svg.parentElement?.nextElementSibling!
							if (titleElement.textContent === content.charAt(0).toUpperCase() + content.replace(/-/g, ' ').slice(1)) titleElement.textContent = ''

							let bend = document.createElement('b')
							bend.textContent = '. '
							bend.classList.add('callout-latex-title')
							titleElement.prepend(bend)

							if (name !== undefined) {
								let i = document.createElement('i')
								i.textContent = `(${name})`
								i.classList.add('callout-latex-name')
								titleElement.prepend(i)
							}

							let b = document.createElement('b')
							b.textContent = title!
							b.classList.add('callout-latex-title')
							titleElement.prepend(b)
						}

						svg.remove()
					}),
			10,
		)
		setTimeout(() => clearInterval(handle), 10_000)
	}

	onload() {
		this.registerMarkdownPostProcessor(this.process)
		this.app.workspace.on('layout-change', () => this.app.workspace.iterateAllLeaves(leaf => leaf.view.getViewType() === 'markdown' && this.process(leaf.view.containerEl)))
	}
}
