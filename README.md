<div class="width: 100vw; display: flex; align-items: center; justify-content: center;">
	<img width="808" height="208" alt="image" src="https://github.com/user-attachments/assets/a4431420-8f75-48b7-b35c-23ddc725ef43" />
</div>

Changes callouts to look more like latex definitions/theorems. Simply enable the plugin, and callouts will now look and work differently. The `{}` in `> [!{}] example` is interpretted differently. Icons are removed, and instead the `{}` is titlized, with `-`'s replaced with spaces, and the contents of `()` brackets being italicized. e.g.

> `> [!definition-(auxiliary-category)]- Whatever your longer title is`
>
> becomes
>
> **Definitions** _(Auxiliary Category)_**.** Whatever your longer title is.

The contents are then indented.

This plugin has two modes: bordered and not bordered, which can be configured in settings.
