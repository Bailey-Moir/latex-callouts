import { Plugin } from "obsidian";

export default class LatexCalloutsPlugin extends Plugin {
	async onload() {
		const processIcons = (element: HTMLElement) => {
			let handle = setInterval(async () => {
				let svgs = element.findAll(`svg.svg-icon`);
				svgs = svgs.filter(svg => svg.parentElement?.classList.contains('callout-icon'))
		
				//if (svgs.length > 0) clearInterval(handle);
		
				svgs.forEach((svg) => {
					let title = svg.parentElement?.parentElement?.parentElement?.getAttr("data-callout")!;
					title = title.charAt(0).toUpperCase() + title.slice(1);
		
					let titleElement = svg.parentElement?.nextElementSibling!;
					
					if (titleElement.textContent == title) titleElement.textContent = "";
					
					let b = document.createElement("b");
					b.textContent = title + " "
					b.classList.add("callout-latex-title");
					
					titleElement.prepend(b);
		
					svg.remove();
					svgs.remove(svg)
				});
			}, 10);
		
			setTimeout(() => {clearInterval(handle)}, 10000);
		};
		this.registerMarkdownPostProcessor(processIcons);

		this.app.workspace.on("layout-change", () => {
			this.app.workspace.iterateAllLeaves((leaf) => {
				if (leaf.view.getViewType() === "markdown") {
					const container = leaf.view.containerEl;
					processIcons(container);
				}
			});
		});
	}
}
