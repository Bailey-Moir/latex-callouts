import { Plugin } from "obsidian";

export default class ExamplePlugin extends Plugin {
	async onload() {
		this.registerMarkdownPostProcessor((element, context) => {
			let f = async () => {
				let svgs = element.findAll(`svg.svg-icon`);
				svgs = svgs.filter(svg => svg.parentElement?.classList.contains('callout-icon'))

				//if (svgs.length > 0) clearInterval(handle);

				svgs.forEach((svg) => {
					let title = svg.parentElement?.parentElement?.parentElement?.getAttr("data-callout")!;
					title = title.charAt(0).toUpperCase() + title.slice(1);

					let titleElement = svg.parentElement?.nextElementSibling!;
					
					if (titleElement.innerHTML == title) titleElement.innerHTML = "";
					
					let b = document.createElement("b");
					b.innerHTML = title + " "
					b.style.fontWeight = "600";
					
					titleElement.prepend(b);

					svg.remove();
					svgs.remove(svg)
				});
			}

			let handle = setInterval(f,10);
			setTimeout(() => {clearInterval(handle)}, 10000);
		});
	}
}
