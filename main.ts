import { Plugin, PluginSettingTab, App, Setting } from 'obsidian';

interface RightSidebarIconsSettings {
	iconOrder: string[];
	showRibbonIcon: boolean;
	isSidebarEnabled: boolean;
}

const DEFAULT_SETTINGS: RightSidebarIconsSettings = {
	iconOrder: [],
	showRibbonIcon: true,
	isSidebarEnabled: true
}

export default class RightSidebarIconsPlugin extends Plugin {
	settings: RightSidebarIconsSettings;
	ribbonIconEl: HTMLElement | null = null;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new RightSidebarIconsSettingTab(this.app, this));

		this.refreshRibbonIcon();
		this.toggleSidebarClass(this.settings.isSidebarEnabled);

		this.addCommand({
			id: 'toggle-right-sidebar-icons',
			name: 'Toggle Right Sidebar Icons Mode',
			callback: () => {
				this.toggleSidebarMode();
			}
		});

		this.app.workspace.onLayoutReady(() => {
			this.applyIconOrder();
			this.setupDragAndDrop();
		});

		// Monitor for layout changes (e.g. tabs added/removed)
		this.registerEvent(this.app.workspace.on('layout-change', () => {
			if (this.settings.isSidebarEnabled) {
				this.applyIconOrder();
				this.setupDragAndDrop();
			}
		}));

		// Handle active leaf change which might trigger DOM updates
		this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
			if (this.settings.isSidebarEnabled) {
				this.applyIconOrder();
				this.setupDragAndDrop();
			}
		}));
	}

	onunload() {
		this.toggleSidebarClass(false);
		if (this.ribbonIconEl) this.ribbonIconEl.remove();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	toggleSidebarMode() {
		this.settings.isSidebarEnabled = !this.settings.isSidebarEnabled;
		this.saveSettings();
		this.toggleSidebarClass(this.settings.isSidebarEnabled);
		
		if (this.settings.isSidebarEnabled) {
			this.applyIconOrder();
			this.setupDragAndDrop();
		}
	}

	toggleSidebarClass(enabled: boolean) {
		if (enabled) {
			document.body.addClass('right-sidebar-icons-enabled');
		} else {
			document.body.removeClass('right-sidebar-icons-enabled');
		}
	}

	refreshRibbonIcon() {
		if (this.ribbonIconEl) {
			this.ribbonIconEl.remove();
			this.ribbonIconEl = null;
		}

		if (this.settings.showRibbonIcon) {
			this.ribbonIconEl = this.addRibbonIcon('sidebar-right', 'Toggle Right Sidebar Icons', (evt: MouseEvent) => {
				this.toggleSidebarMode();
			});
		}
	}

	getIconContainer(): HTMLElement | null {
		return document.querySelector('.mod-right-split .workspace-tabs.mod-top.mod-top-right-space .workspace-tab-header-container-inner');
	}

	applyIconOrder() {
		if (!this.settings.isSidebarEnabled) return;

		const container = this.getIconContainer();
		if (!container) return;

		const iconOrder = this.settings.iconOrder;
		if (!iconOrder || iconOrder.length === 0) return;

		const children = Array.from(container.querySelectorAll('.workspace-tab-header')) as HTMLElement[];
		if (children.length === 0) return;

		const childMap = new Map<string, HTMLElement>();
		children.forEach(child => {
			const label = child.getAttribute('aria-label') || '';
			if (label) childMap.set(label, child);
		});

		iconOrder.forEach(label => {
			const child = childMap.get(label);
			if (child) {
				container.appendChild(child);
				childMap.delete(label);
			}
		});

		childMap.forEach(child => {
			container.appendChild(child);
		});
	}

	setupDragAndDrop() {
		if (!this.settings.isSidebarEnabled) return;

		const container = this.getIconContainer();
		if (!container) return;

		const headers = container.querySelectorAll('.workspace-tab-header');
		headers.forEach((header: HTMLElement) => {
			if (header.getAttribute('data-sidebar-drag-setup')) return;
			header.setAttribute('data-sidebar-drag-setup', 'true');
			header.setAttribute('draggable', 'true');

			header.addEventListener('dragstart', (e) => {
				header.addClass('is-dragging');
			});

			header.addEventListener('dragend', () => {
				header.removeClass('is-dragging');
				this.saveNewOrder();
			});

			header.addEventListener('dragover', (e) => {
				const draggingItem = container.querySelector('.is-dragging');
				if (!draggingItem || draggingItem === header) return;

				const bounding = header.getBoundingClientRect();
				const offset = e.clientY - bounding.top - bounding.height / 2;

				if (offset > 0) {
					header.after(draggingItem);
				} else {
					header.before(draggingItem);
				}
			});
		});
	}

	async saveNewOrder() {
		const container = this.getIconContainer();
		if (!container) return;

		const children = Array.from(container.querySelectorAll('.workspace-tab-header')) as HTMLElement[];
		const newOrder = children.map(child => child.getAttribute('aria-label') || '').filter(label => label !== '');

		this.settings.iconOrder = newOrder;
		await this.saveSettings();
	}
}

class RightSidebarIconsSettingTab extends PluginSettingTab {
	plugin: RightSidebarIconsPlugin;

	constructor(app: App, plugin: RightSidebarIconsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: 'Right Sidebar Icons Settings'});

		new Setting(containerEl)
			.setName('Show Ribbon Icon')
			.setDesc('Turn on to display an icon in the left ribbon to quickly toggle the custom right sidebar mode.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showRibbonIcon)
				.onChange(async (value) => {
					this.plugin.settings.showRibbonIcon = value;
					await this.plugin.saveSettings();
					this.plugin.refreshRibbonIcon();
				}));
	}
}
