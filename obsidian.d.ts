import { Extension, StateField } from '@codemirror/state';
import { EditorView, ViewPlugin } from '@codemirror/view';
import * as CodeMirror from 'codemirror';
import * as Moment from 'moment';

declare global {
    interface ObjectConstructor {
        isEmpty(object: Record<string, any>): boolean;
        each<T>(object: {
            [key: string]: T;
        }, callback: (value: T, key?: string) => boolean | void, context?: any): boolean;
    }
    interface Array<T> {
        first(): T | undefined;
        last(): T | undefined;
        contains(target: T): boolean;
        remove(target: T): void;
        shuffle(): this;
        unique(): T[];
    }
    interface Math {
        clamp(value: number, min: number, max: number): number;
        square(value: number): number;
    }
    interface StringConstructor {
        isString(obj: any): obj is string;
    }
    interface String {
        contains(target: string): boolean;
        startsWith(searchString: string, position?: number): boolean;
        endsWith(target: string, length?: number): boolean;
        format(...args: string[]): string;
    }
    interface NumberConstructor {
        isNumber(obj: any): obj is number;
    }
    interface Node {
        detach(): void;
        empty(): void;
        insertAfter(other: Node): void;
        indexOf(other: Node): number;
        setChildrenInPlace(children: Node[]): void;
        appendText(val: string): void;
        /**
         * Cross-window capable instanceof check, a drop-in replacement
         * for instanceof checks on DOM Nodes. Remember to also check
         * for nulls when necessary.
         * @param type
         */
        instanceOf<T>(type: {
            new (): T;
        }): this is T;
        /**
         * The document this node belongs to, or the global document.
         */
        doc: Document;
        /**
         * The window object this node belongs to, or the global window.
         */
        win: Window;
    }
    interface Element extends Node {
        getText(): string;
        setText(val: string | DocumentFragment): void;
        addClass(...classes: string[]): void;
        addClasses(classes: string[]): void;
        removeClass(...classes: string[]): void;
        removeClasses(classes: string[]): void;
        toggleClass(classes: string | string[], value: boolean): void;
        hasClass(cls: string): boolean;
        setAttr(qualifiedName: string, value: string | number | boolean | null): void;
        setAttrs(obj: {
            [key: string]: string | number | boolean | null;
        }): void;
        getAttr(qualifiedName: string): string | null;
        matchParent(selector: string, lastParent?: Element): Element | null;
        getCssPropertyValue(property: string, pseudoElement?: string): string;
    }
    interface HTMLElement extends Element {
        show(): void;
        hide(): void;
        toggle(show: boolean): void;
        toggleVisibility(visible: boolean): void;
        /**
         * Returns whether this element is shown, when the element is attached to the DOM and
         * none of the parent and ancestor elements are hidden with `display: none`.
         *
         * Exception: Does not work on <body> and <html>, or on elements with `position: fixed`.
         */
        isShown(): boolean;
        /**
         * Get the inner width of this element without padding.
         */
        readonly innerWidth: number;
        /**
         * Get the inner height of this element without padding.
         */
        readonly innerHeight: number;
    }
    function isBoolean(obj: any): obj is boolean;
    function fish(selector: string): HTMLElement | null;
    function fishAll(selector: string): HTMLElement[];
    interface Element extends Node {
        find(selector: string): Element | null;
        findAll(selector: string): HTMLElement[];
        findAllSelf(selector: string): HTMLElement[];
    }
    interface HTMLElement extends Element {
        find(selector: string): HTMLElement;
        findAll(selector: string): HTMLElement[];
        findAllSelf(selector: string): HTMLElement[];
    }
    interface DocumentFragment extends Node, NonElementParentNode, ParentNode {
        find(selector: string): HTMLElement;
        findAll(selector: string): HTMLElement[];
    }
    interface DomElementInfo {
        /**
         * The class to be assigned. Can be a space-separated string or an array of strings.
         */
        cls?: string | string[];
        /**
         * The textContent to be assigned.
         */
        text?: string | DocumentFragment;
        /**
         * HTML attributes to be added.
         */
        attr?: {
            [key: string]: string | number | boolean | null;
        };
        /**
         * HTML title (for hover tooltip).
         */
        title?: string;
        /**
         * The parent element to be assigned to.
         */
        parent?: Node;
        value?: string;
        type?: string;
        prepend?: boolean;
        placeholder?: string;
        href?: string;
    }
    interface Node {
        /**
         * Create an element and append it to this node.
         */
        createEl<K extends keyof HTMLElementTagNameMap>(tag: K, o?: DomElementInfo | string, callback?: (el: HTMLElementTagNameMap[K]) => void): HTMLElementTagNameMap[K];
        createDiv(o?: DomElementInfo | string, callback?: (el: HTMLDivElement) => void): HTMLDivElement;
        createSpan(o?: DomElementInfo | string, callback?: (el: HTMLSpanElement) => void): HTMLSpanElement;
    }
    function createEl<K extends keyof HTMLElementTagNameMap>(tag: K, o?: DomElementInfo | string, callback?: (el: HTMLElementTagNameMap[K]) => void): HTMLElementTagNameMap[K];
    function createDiv(o?: DomElementInfo | string, callback?: (el: HTMLDivElement) => void): HTMLDivElement;
    function createSpan(o?: DomElementInfo | string, callback?: (el: HTMLSpanElement) => void): HTMLSpanElement;
    function createFragment(callback?: (el: DocumentFragment) => void): DocumentFragment;
    interface EventListenerInfo {
        selector: string;
        listener: Function;
        options?: boolean | AddEventListenerOptions;
        callback: Function;
    }
    interface HTMLElement extends Element {
        _EVENTS?: {
            [K in keyof HTMLElementEventMap]?: EventListenerInfo[];
        };
        on<K extends keyof HTMLElementEventMap>(this: HTMLElement, type: K, selector: string, listener: (this: HTMLElement, ev: HTMLElementEventMap[K], delegateTarget: HTMLElement) => any, options?: boolean | AddEventListenerOptions): void;
        off<K extends keyof HTMLElementEventMap>(this: HTMLElement, type: K, selector: string, listener: (this: HTMLElement, ev: HTMLElementEventMap[K], delegateTarget: HTMLElement) => any, options?: boolean | AddEventListenerOptions): void;
        onClickEvent(this: HTMLElement, listener: (this: HTMLElement, ev: MouseEvent) => any, options?: boolean | AddEventListenerOptions): void;
        /**
         * @param listener - the callback to call when this node is inserted into the DOM.
         * @param once - if true, this will only fire once and then unhook itself.
         * @returns destroy - a function to remove the event handler to avoid memory leaks.
         */
        onNodeInserted(this: HTMLElement, listener: () => any, once?: boolean): () => void;
        /**
         * @param listener - the callback to call when this node has been migrated to another window.
         * @returns destroy - a function to remove the event handler to avoid memory leaks.
         */
        onWindowMigrated(this: HTMLElement, listener: (win: Window) => any): () => void;
        trigger(eventType: string): void;
    }
    interface Document {
        _EVENTS?: {
            [K in keyof DocumentEventMap]?: EventListenerInfo[];
        };
        on<K extends keyof DocumentEventMap>(this: Document, type: K, selector: string, listener: (this: Document, ev: DocumentEventMap[K], delegateTarget: HTMLElement) => any, options?: boolean | AddEventListenerOptions): void;
        off<K extends keyof DocumentEventMap>(this: Document, type: K, selector: string, listener: (this: Document, ev: DocumentEventMap[K], delegateTarget: HTMLElement) => any, options?: boolean | AddEventListenerOptions): void;
    }
    interface UIEvent extends Event {
        targetNode: Node | null;
        win: Window;
        doc: Document;
        /**
         * Cross-window capable instanceof check, a drop-in replacement
         * for instanceof checks on UIEvents.
         * @param type
         */
        instanceOf<T>(type: {
            new (...data: any[]): T;
        }): this is T;
    }
    interface AjaxOptions {
        method?: 'GET' | 'POST';
        url: string;
        success?: (response: any, req: XMLHttpRequest) => any;
        error?: (error: any, req: XMLHttpRequest) => any;
        data?: object | string | ArrayBuffer;
        headers?: Record<string, string>;
        withCredentials?: boolean;
        req?: XMLHttpRequest;
    }
    function ajax(options: AjaxOptions): void;
    function ajaxPromise(options: AjaxOptions): Promise<any>;
    function ready(fn: () => any): void;
    function sleep(ms: number): Promise<void>;
    /**
     * The actively focused Window object. This is usually the same as `window` but
     * it will be different when using popout windows.
     */
    let activeWindow: Window;
    /**
     * The actively focused Document object. This is usually the same as `document` but
     * it will be different when using popout windows.
     */
    let activeDocument: Document;
    interface Window extends EventTarget, AnimationFrameProvider, GlobalEventHandlers, WindowEventHandlers, WindowLocalStorage, WindowOrWorkerGlobalScope, WindowSessionStorage {
        /**
         * The actively focused Window object. This is usually the same as `window` but
         * it will be different when using popout windows.
         */
        activeWindow: Window;
        /**
         * The actively focused Document object. This is usually the same as `document` but
         * it will be different when using popout windows.
         */
        activeDocument: Document;
    }
}
declare global {
    interface Touch {
        touchType: 'stylus' | 'direct';
    }
}
/**
 * @public
 */
export class AbstractTextComponent<T extends HTMLInputElement | HTMLTextAreaElement> extends ValueComponent<string> {
    /**
     * @public
     */
    inputEl: T;

    /**
     * @public
     */
    constructor(inputEl: T);
    /**
     * @public
     */
    setDisabled(disabled: boolean): this;
    /**
     * @public
     */
    getValue(): string;
    /**
     * @public
     */
    setValue(value: string): this;
    /**
     * @public
     */
    setPlaceholder(placeholder: string): this;
    /**
     * @public
     */
    onChanged(): void;
    /**
     * @public
     */
    onChange(callback: (value: string) => any): this;
}

/**
 * Adds an icon to the library
 * @param iconId - the icon ID
 * @param svgContent - the content of the SVG.
 * @public
 */
export function addIcon(iconId: string, svgContent: string): void;

/**
 * This is the API version of the app, which follows the release cycle of the desktop app.
 * Example: "0.13.21"
 * @public
 */
export let apiVersion: string;

/**
 * @public
 */
export class App {

    /** @public */
    keymap: Keymap;
    /** @public */
    scope: Scope;

    /** @public */
    workspace: Workspace;

    /** @public */
    vault: Vault;
    /** @public */
    metadataCache: MetadataCache;

    /** @public */
    fileManager: FileManager;

    /**
     * The last known user interaction event, to help commands find out what modifier keys are pressed.
     * @public
     */
    lastEvent: UserEvent | null;

}

/** @public */
export function arrayBufferToBase64(buffer: ArrayBuffer): string;

/** @public */
export function arrayBufferToHex(data: ArrayBuffer): string;

/** @public */
export function base64ToArrayBuffer(base64: string): ArrayBuffer;

/**
 * @public
 */
export abstract class BaseComponent {
    /** @public */
    disabled: boolean;
    /**
     * Facilitates chaining
     * @public
     */
    then(cb: (component: this) => any): this;
    /**
     * @public
     */
    setDisabled(disabled: boolean): this;
}

/**
 * @public
 */
export interface BlockCache extends CacheItem {
    /** @public */
    id: string;
}

/**
 * @public
 */
export interface BlockSubpathResult extends SubpathResult {
    /**
     * @public
     */
    type: 'block';
    /**
     * @public
     */
    block: BlockCache;
    /**
     * @public
     */
    list?: ListItemCache;
}

/**
 * @public
 */
export class ButtonComponent extends BaseComponent {
    /**
     * @public
     */
    buttonEl: HTMLButtonElement;

    /**
     * @public
     */
    constructor(containerEl: HTMLElement);
    /**
     * @public
     */
    setDisabled(disabled: boolean): this;
    /**
     * @public
     */
    setCta(): this;
    /**
     * @public
     */
    removeCta(): this;
    /**
     * @public
     */
    setWarning(): this;
    /**
     * @public
     */
    setTooltip(tooltip: string): this;
    /**
     * @public
     */
    setButtonText(name: string): this;
    /**
     * @public
     */
    setIcon(icon: string): this;
    /**
     * @public
     */
    setClass(cls: string): this;
    /**
     * @public
     */
    onClick(callback: (evt: MouseEvent) => any): this;
}

/**
 * @public
 */
export interface CachedMetadata {
    /**
     * @public
     */
    links?: LinkCache[];
    /**
     * @public
     */
    embeds?: EmbedCache[];
    /**
     * @public
     */
    tags?: TagCache[];
    /**
     * @public
     */
    headings?: HeadingCache[];
    /**
     * Sections are root level markdown blocks, which can be used to divide the document up.
     * @public
     */
    sections?: SectionCache[];
    /**
     * @public
     */
    listItems?: ListItemCache[];
    /**
     * @public
     */
    frontmatter?: FrontMatterCache;
    /**
     * @public
     */
    blocks?: Record<string, BlockCache>;
}

/**
 * @public
 */
export interface CacheItem {
    /**
     * @public
     */
    position: Pos;

}

/** @public */
export interface CloseableComponent {

    /** @public */
    close(): any;
}

/**
 * Color picker component. Values are by default 6-digit hash-prefixed hex strings like `#000000`.
 * @public
 */
export class ColorComponent extends ValueComponent<string> {

    /**
     * @public
     */
    constructor(containerEl: HTMLElement);
    /**
     * @public
     */
    getValue(): HexString;
    /**
     * @public
     */
    getValueRgb(): RGB;
    /**
     * @public
     */
    getValueHsl(): HSL;

    /**
     * @public
     */
    setValue(value: HexString): this;
    /**
     * @public
     */
    setValueRgb(rgb: RGB): this;
    /**
     * @public
     */
    setValueHsl(hsl: HSL): this;

    /**
     * @public
     */
    onChange(callback: (value: string) => any): this;
}

/**
 * @public
 */
export interface Command {
    /**
     * Globally unique ID to identify this command.
     * @public
     */
    id: string;
    /**
     * Human friendly name for searching.
     * @public
     */
    name: string;
    /**
     * Icon ID to be used in the toolbar.
     * @public
     */
    icon?: string;
    /** @public */
    mobileOnly?: boolean;
    /**
     * Whether holding the hotkey should repeatedly trigger this command. Defaults to false.
     * @public
     */
    repeatable?: boolean;
    /**
     * Simple callback, triggered globally.
     * @public
     */
    callback?: () => any;
    /**
     * Complex callback, overrides the simple callback.
     * Used to "check" whether your command can be performed in the current circumstances.
     * For example, if your command requires the active focused pane to be a MarkdownSourceView, then
     * you should only return true if the condition is satisfied. Returning false or undefined causes
     * the command to be hidden from the command palette.
     *
     * @param checking - Whether the command palette is just "checking" if your command should show right now.
     * If checking is true, then this function should not perform any action.
     * If checking is false, then this function should perform the action.
     * @returns Whether this command can be executed at the moment.
     * @public
     */
    checkCallback?: (checking: boolean) => boolean | void;

    /**
     * A command callback that is only triggered when the user is in an editor.
     * Overrides `callback` and `checkCallback`
     * @public
     */
    editorCallback?: (editor: Editor, view: MarkdownView) => any;
    /**
     * A command callback that is only triggered when the user is in an editor.
     * Overrides `editorCallback`, `callback` and `checkCallback`
     * @public
     */
    editorCheckCallback?: (checking: boolean, editor: Editor, view: MarkdownView) => boolean | void;
    /**
     * Sets the default hotkey. It is recommended for plugins to avoid setting default hotkeys if possible,
     * to avoid conflicting hotkeys with one that's set by the user, even though customized hotkeys have higher priority.
     * @public
     */
    hotkeys?: Hotkey[];
}

/**
 * @public
 */
export class Component {

    /**
     * Load this component and its children
     * @public
     */
    load(): void;
    /**
     * Override this to load your component
     * @public
     * @virtual
     */
    onload(): void;
    /**
     * Unload this component and its children
     * @public
     */
    unload(): void;
    /**
     * Override this to unload your component
     * @public
     * @virtual
     */
    onunload(): void;
    /**
     * Adds a child component, loading it if this component is loaded
     * @public
     */
    addChild<T extends Component>(component: T): T;
    /**
     * Removes a child component, unloading it
     * @public
     */
    removeChild<T extends Component>(component: T): T;
    /**
     * Registers a callback to be called when unloading
     * @public
     */
    register(cb: () => any): void;
    /**
     * Registers an event to be detached when unloading
     * @public
     */
    registerEvent(eventRef: EventRef): void;
    /**
     * Registers an DOM event to be detached when unloading
     * @public
     */
    registerDomEvent<K extends keyof WindowEventMap>(el: Window, type: K, callback: (this: HTMLElement, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    /**
     * Registers an DOM event to be detached when unloading
     * @public
     */
    registerDomEvent<K extends keyof DocumentEventMap>(el: Document, type: K, callback: (this: HTMLElement, ev: DocumentEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    /**
     * Registers an DOM event to be detached when unloading
     * @public
     */
    registerDomEvent<K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, callback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    /**
     * Registers an key event to be detached when unloading
     * @public
     */
    registerScopeEvent(keyHandler: KeymapEventHandler): void;
    /**
     * Registers an interval (from setInterval) to be cancelled when unloading
     * Use {@link window.setInterval} instead of {@link setInterval} to avoid TypeScript confusing between NodeJS vs Browser API
     * @public
     */
    registerInterval(id: number): number;
}

/** @public */
export type Constructor<T> = abstract new (...args: any[]) => T;

/**
 * @public
 */
export interface DataAdapter {

    /**
     * @public
     */
    getName(): string;

    /**
     * @public
     */
    exists(normalizedPath: string, sensitive?: boolean): Promise<boolean>;
    /**
     * @public
     */
    stat(normalizedPath: string): Promise<Stat | null>;
    /**
     * @public
     */
    list(normalizedPath: string): Promise<ListedFiles>;
    /**
     * @public
     */
    read(normalizedPath: string): Promise<string>;
    /**
     * @public
     */
    readBinary(normalizedPath: string): Promise<ArrayBuffer>;
    /**
     * @public
     */
    write(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void>;
    /**
     * @public
     */
    writeBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void>;
    /**
     * @public
     */
    append(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void>;
    /**
     * @public
     */
    getResourcePath(normalizedPath: string): string;
    /**
     * @public
     */
    mkdir(normalizedPath: string): Promise<void>;
    /**
     * @public
     */
    trashSystem(normalizedPath: string): Promise<boolean>;
    /**
     * @public
     */
    trashLocal(normalizedPath: string): Promise<void>;
    /**
     * @public
     */
    rmdir(normalizedPath: string, recursive: boolean): Promise<void>;
    /**
     * @public
     */
    remove(normalizedPath: string): Promise<void>;

    /**
     * @public
     */
    rename(normalizedPath: string, normalizedNewPath: string): Promise<void>;
    /**
     * @public
     */
    copy(normalizedPath: string, normalizedNewPath: string): Promise<void>;
}

/**
 * @public
 */
export interface DataWriteOptions {
    /** @public */
    ctime?: number;
    /** @public */
    mtime?: number;

}

/**
 * A standard debounce function.
 *
 * @param cb - The function to call.
 * @param timeout - The timeout to wait.
 * @param resetTimer - Whether to reset the timeout when the debouncer is called again.
 * @returns a debounced function that takes the same parameter as the original function.
 * @public
 */
export function debounce<T extends unknown[], V>(cb: (...args: [...T]) => V, timeout?: number, resetTimer?: boolean): Debouncer<T, V>;

/** @public */
export interface Debouncer<T extends unknown[], V> {
    /** @public */
    (...args: [...T]): this;
    /** @public */
    cancel(): this;

}

/**
 * @public
 */
export class DropdownComponent extends ValueComponent<string> {
    /**
     * @public
     */
    selectEl: HTMLSelectElement;

    /**
     * @public
     */
    constructor(containerEl: HTMLElement);
    /**
     * @public
     */
    setDisabled(disabled: boolean): this;
    /**
     * @public
     */
    addOption(value: string, display: string): this;
    /**
     * @public
     */
    addOptions(options: Record<string, string>): this;
    /**
     * @public
     */
    getValue(): string;
    /**
     * @public
     */
    setValue(value: string): this;
    /**
     * @public
     */
    onChange(callback: (value: string) => any): this;
}

/**
 * @public
 */
export abstract class EditableFileView extends FileView {

}

/**
 * A common interface that bridges the gap between CodeMirror 5 and CodeMirror 6.
 * @public
 */
export abstract class Editor {

    /** @public */
    getDoc(): this;
    /** @public */
    abstract refresh(): void;
    /** @public */
    abstract getValue(): string;
    /** @public */
    abstract setValue(content: string): void;
    /**
     * Get the text at line (0-indexed)
     * @public
     */
    abstract getLine(line: number): string;
    /** @public */
    setLine(n: number, text: string): void;
    /**
     * Gets the number of lines in the document
     * @public
     */
    abstract lineCount(): number;
    /** @public */
    abstract lastLine(): number;
    /** @public */
    abstract getSelection(): string;
    /** @public */
    somethingSelected(): boolean;
    /** @public */
    abstract getRange(from: EditorPosition, to: EditorPosition): string;
    /** @public */
    abstract replaceSelection(replacement: string, origin?: string): void;
    /** @public */
    abstract replaceRange(replacement: string, from: EditorPosition, to?: EditorPosition, origin?: string): void;
    /** @public */
    abstract getCursor(string?: 'from' | 'to' | 'head' | 'anchor'): EditorPosition;
    /** @public */
    abstract listSelections(): EditorSelection[];
    /** @public */
    setCursor(pos: EditorPosition | number, ch?: number): void;
    /** @public */
    abstract setSelection(anchor: EditorPosition, head?: EditorPosition): void;
    /** @public */
    abstract setSelections(ranges: EditorSelectionOrCaret[], main?: number): void;
    /** @public */
    abstract focus(): void;
    /** @public */
    abstract blur(): void;
    /** @public */
    abstract hasFocus(): boolean;
    /** @public */
    abstract getScrollInfo(): {
        /** @public */
        top: number;
        /** @public */
        left: number;
    };
    /** @public */
    abstract scrollTo(x?: number | null, y?: number | null): void;
    /** @public */
    abstract scrollIntoView(range: EditorRange, center?: boolean): void;
    /** @public */
    abstract undo(): void;
    /** @public */
    abstract redo(): void;
    /** @public */
    abstract exec(command: EditorCommandName): void;
    /** @public */
    abstract transaction(tx: EditorTransaction, origin?: string): void;
    /** @public */
    abstract wordAt(pos: EditorPosition): EditorRange | null;
    /** @public */
    abstract posToOffset(pos: EditorPosition): number;
    /** @public */
    abstract offsetToPos(offset: number): EditorPosition;

    /** @public */
    processLines<T>(read: (line: number, lineText: string) => T | null, write: (line: number, lineText: string, value: T | null) => EditorChange | void, ignoreEmpty?: boolean): void;

}

/** @public */
export interface EditorChange extends EditorRangeOrCaret {
    /** @public */
    text: string;
}

/** @public */
export type EditorCommandName = 'goUp' | 'goDown' | 'goLeft' | 'goRight' | 'goStart' | 'goEnd' | 'goWordLeft' | 'goWordRight' | 'indentMore' | 'indentLess' | 'newlineAndIndent' | 'swapLineUp' | 'swapLineDown' | 'deleteLine' | 'toggleFold' | 'foldAll' | 'unfoldAll';

/**
 * Use this StateField to get a reference to the EditorView
 * @public
 */
export const editorEditorField: StateField<EditorView>;

/**
 * Use this StateField to get information about this markdown editor, such as the associated file, or the Editor.
 * @public
 */
export const editorInfoField: StateField<MarkdownFileInfo>;

/**
 * Use this StateField to check whether Live Preview is active
 * @public
 */
export const editorLivePreviewField: StateField<boolean>;

/** @public */
export interface EditorPosition {
    /** @public */
    line: number;
    /** @public */
    ch: number;
}

/** @public */
export interface EditorRange {
    /** @public */
    from: EditorPosition;
    /** @public */
    to: EditorPosition;
}

/** @public */
export interface EditorRangeOrCaret {
    /** @public */
    from: EditorPosition;
    /** @public */
    to?: EditorPosition;
}

/** @public */
export interface EditorScrollInfo {
    /** @public */
    left: number;
    /** @public */
    top: number;
    /** @public */
    width: number;
    /** @public */
    height: number;
    /** @public */
    clientWidth: number;
    /** @public */
    clientHeight: number;
}

/** @public */
export interface EditorSelection {
    /** @public */
    anchor: EditorPosition;
    /** @public */
    head: EditorPosition;
}

/** @public */
export interface EditorSelectionOrCaret {
    /** @public */
    anchor: EditorPosition;
    /** @public */
    head?: EditorPosition;
}

/** @public */
export abstract class EditorSuggest<T> extends PopoverSuggest<T> {
    /**
     * Current suggestion context, containing the result of `onTrigger`.
     * This will be null any time the EditorSuggest is not supposed to run.
     * @public
     */
    context: EditorSuggestContext | null;
    /**
     * Override this to use a different limit for suggestion items
     * @public
     */
    limit: number;
    /** @public */
    constructor(app: App);
    /**
     * @public
     */
    setInstructions(instructions: Instruction[]): void;

    /**
     * Based on the editor line and cursor position, determine if this EditorSuggest should be triggered at this moment.
     * Typically, you would run a regular expression on the current line text before the cursor.
     * Return null to indicate that this editor suggest is not supposed to be triggered.
     *
     * Please be mindful of performance when implementing this function, as it will be triggered very often (on each keypress).
     * Keep it simple, and return null as early as possible if you determine that it is not the right time.
     * @public
     */
    abstract onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null;
    /**
     * Generate suggestion items based on this context. Can be async, but preferably sync.
     * When generating async suggestions, you should pass the context along.
     * @public
     */
    abstract getSuggestions(context: EditorSuggestContext): T[] | Promise<T[]>;

}

/** @public */
export interface EditorSuggestContext extends EditorSuggestTriggerInfo {
    /** @public */
    editor: Editor;
    /** @public */
    file: TFile;
}

/** @public */
export interface EditorSuggestTriggerInfo {
    /**
     * The start position of the triggering text. This is used to position the popover.
     * @public
     */
    start: EditorPosition;
    /**
     * The end position of the triggering text. This is used to position the popover.
     * @public
     */
    end: EditorPosition;
    /**
     * They query string (usually the text between start and end) that will be used to generate the suggestion content.
     * @public
     */
    query: string;
}

/** @public */
export interface EditorTransaction {
    /** @public */
    replaceSelection?: string;
    /** @public */
    changes?: EditorChange[];
    /**
     * Multiple selections, overrides `selection`.
     * @public
     */
    selections?: EditorRangeOrCaret[];
    /** @public */
    selection?: EditorRangeOrCaret;
}

/**
 * Use this StateField to get a reference to the MarkdownView.
 * This is now deprecated because it is possible for an editor to not be associated with a MarkdownView.
 * @see {@link editorInfoField} - for the new recommended field to use.
 * @public
 * @deprecated
 */
export const editorViewField: StateField<MarkdownView>;

/**
 * @public
 */
export interface EmbedCache extends ReferenceCache {
}

/**
 * @public
 */
export interface EventRef {

}

/**
 * @public
 */
export class Events {

    /**
     * @public
     */
    on(name: string, callback: (...data: any) => any, ctx?: any): EventRef;
    /**
     * @public
     */
    off(name: string, callback: (...data: any) => any): void;
    /**
     * @public
     */
    offref(ref: EventRef): void;
    /**
     * @public
     */
    trigger(name: string, ...data: any[]): void;
    /**
     * @public
     */
    tryTrigger(evt: EventRef, args: any[]): void;
}

/**
 * @public
 */
export class ExtraButtonComponent extends BaseComponent {
    /**
     * @public
     */
    extraSettingsEl: HTMLElement;

    /**
     * @public
     */
    constructor(containerEl: HTMLElement);
    /**
     * @public
     */
    setDisabled(disabled: boolean): this;
    /**
     * @public
     */
    setTooltip(tooltip: string): this;
    /**
     * @public
     */
    setIcon(icon: string): this;
    /**
     * @public
     */
    onClick(callback: () => any): this;
}

/**
 * Manage the creation, deletion and renaming of files from the UI.
 * @public
 */
export class FileManager {

    /**
     * Gets the folder that new files should be saved to, given the user's preferences.
     * @param sourcePath - The path to the current open/focused file,
     * used when the user wants new files to be created "in the same folder".
     * Use an empty string if there is no active file.
     * @public
     */
    getNewFileParent(sourcePath: string): TFolder;

    /**
     * Rename or move a file safely, and update all links to it depending on the user's preferences.
     * @param file - the file to rename
     * @param newPath - the new path for the file
     * @public
     */
    renameFile(file: TAbstractFile, newPath: string): Promise<void>;

    /**
     * Generate a markdown link based on the user's preferences.
     * @param file - the file to link to.
     * @param sourcePath - where the link is stored in, used to compute relative links.
     * @param subpath - A subpath, starting with `#`, used for linking to headings or blocks.
     * @param alias - The display text if it's to be different than the file name. Pass empty string to use file name.
     * @public
     */
    generateMarkdownLink(file: TFile, sourcePath: string, subpath?: string, alias?: string): string;

}

/**
 * @public
 */
export interface FileStats {
    /** @public */
    ctime: number;
    /** @public */
    mtime: number;
    /** @public */
    size: number;
}

/**
 * @public
 */
export class FileSystemAdapter implements DataAdapter {

    /**
     * @public
     */
    getName(): string;
    /**
     * @public
     */
    getBasePath(): string;

    /**
     * @public
     */
    mkdir(normalizedPath: string): Promise<void>;
    /**
     * @public
     */
    trashSystem(normalizedPath: string): Promise<boolean>;
    /**
     * @public
     */
    trashLocal(normalizedPath: string): Promise<void>;
    /**
     * @public
     */
    rmdir(normalizedPath: string, recursive: boolean): Promise<void>;
    /**
     * @public
     */
    read(normalizedPath: string): Promise<string>;
    /**
     * @public
     */
    readBinary(normalizedPath: string): Promise<ArrayBuffer>;
    /**
     * @public
     */
    write(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void>;
    /**
     * @public
     */
    writeBinary(normalizedPath: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<void>;
    /**
     * @public
     */
    append(normalizedPath: string, data: string, options?: DataWriteOptions): Promise<void>;

    /**
     * @public
     */
    getResourcePath(normalizedPath: string): string;
    /**
     * Returns the file:// path of this file
     * @public
     */
    getFilePath(normalizedPath: string): string;
    /**
     * @public
     */
    remove(normalizedPath: string): Promise<void>;

    /**
     * @public
     */
    rename(normalizedPath: string, normalizedNewPath: string): Promise<void>;
    /**
     * @public
     */
    copy(normalizedPath: string, normalizedNewPath: string): Promise<void>;
    /**
     * @public
     */
    exists(normalizedPath: string, sensitive?: boolean): Promise<boolean>;

    /**
     * @public
     */
    stat(normalizedPath: string): Promise<Stat | null>;
    /**
     * @public
     */
    list(normalizedPath: string): Promise<ListedFiles>;

    /**
     * @public
     */
    getFullPath(normalizedPath: string): string;

    /**
     * @public
     */
    static readLocalFile(path: string): Promise<ArrayBuffer>;
    /**
     * @public
     */
    static mkdir(path: string): Promise<void>;
}

/**
 * @public
 */
export abstract class FileView extends ItemView {
    /**
     * @public
     */
    allowNoFile: boolean;
    /**
     * @public
     */
    file: TFile;
    /**
     * File views can be navigated by default.
     * @inheritDoc
     * @public
     */
    navigation: boolean;
    /**
     * @public
     */
    constructor(leaf: WorkspaceLeaf);

    /**
     * @public
     */
    getDisplayText(): string;
    /**
     * @public
     */
    onload(): void;
    /**
     * @public
     */
    getState(): any;

    /**
     * @public
     */
    setState(state: any, result: ViewStateResult): Promise<void>;

    /**
     * @public
     */
    onLoadFile(file: TFile): Promise<void>;
    /**
     * @public
     */
    onUnloadFile(file: TFile): Promise<void>;
    /**
     * @public
     */
    onRename(file: TFile): Promise<void>;

    /**
     * @public
     */
    canAcceptExtension(extension: string): boolean;
}

/**
 * Flush the MathJax stylesheet.
 * @public
 */
export function finishRenderMath(): Promise<void>;

/**
 * @public
 */
export interface FrontMatterCache extends CacheItem {
    /**
     * @public
     */
    [key: string]: any;
}

/**
 * @public
 */
export interface FuzzyMatch<T> {
    /** @public */
    item: T;
    /** @public */
    match: SearchResult;
}

/**
 * @public
 */
export function fuzzySearch(q: PreparedQuery, text: string): SearchResult | null;

/**
 * @public
 */
export abstract class FuzzySuggestModal<T> extends SuggestModal<FuzzyMatch<T>> {
    /**
     * @public
     */
    getSuggestions(query: string): FuzzyMatch<T>[];
    /**
     * @public
     */
    renderSuggestion(item: FuzzyMatch<T>, el: HTMLElement): void;
    /**
     * @public
     */
    onChooseSuggestion(item: FuzzyMatch<T>, evt: MouseEvent | KeyboardEvent): void;
    /**
     * @public
     */
    abstract getItems(): T[];
    /**
     * @public
     */
    abstract getItemText(item: T): string;
    /**
     * @public
     */
    abstract onChooseItem(item: T, evt: MouseEvent | KeyboardEvent): void;
}

/**
 * @public
 */
export function getAllTags(cache: CachedMetadata): string[] | null;

/** @public */
export function getBlobArrayBuffer(blob: Blob): Promise<ArrayBuffer>;

/**
 * Create an SVG from an iconId. Returns null if no icon associated with the iconId.
 * @param iconId - the icon ID
 * @param size - the width and height to use
 * @public
 */
export function getIcon(iconId: string, size?: number): SVGSVGElement | null;

/**
 * @public
 */
export function getLinkpath(linktext: string): string;

/**
 * @public
 */
export interface HeadingCache extends CacheItem {
    /**
     * @public
     */
    heading: string;
    /**
     * @public
     */
    level: number;
}

/**
 * @public
 */
export interface HeadingSubpathResult extends SubpathResult {
    /**
     * @public
     */
    type: 'heading';
    /**
     * @public
     */
    current: HeadingCache;
    /**
     * @public
     */
    next: HeadingCache;
}

/**
 * Hex strings are 6-digit hash-prefixed rgb strings in lowercase form.
 * Example: #ffffff
 * @public
 */
export type HexString = string;

/** @public */
export function hexToArrayBuffer(hex: string): ArrayBuffer;

/**
 * @public
 */
export interface Hotkey {
    /** @public */
    modifiers: Modifier[];
    /** @public */
    key: string;

}

/**
 * @public
 */
export interface HoverParent {
    /** @public */
    hoverPopover: HoverPopover | null;
}

/**
 * @public
 */
export class HoverPopover extends Component {

    /**
     * @public
     */
    hoverEl: HTMLElement;
    /**
     * @public
     */
    state: PopoverState;

    /**
     * @public
     */
    constructor(parent: HoverParent, targetEl: HTMLElement | null, waitTime?: number);

}

/**
 * @public
 */
export interface HSL {
    /**
     * Hue integer value between 0 and 360
     * @public
     */
    h: number;
    /**
     * Saturation integer value between 0 and 100
     * @public
     */
    s: number;
    /**
     * Lightness integer value between 0 and 100
     * @public
     */
    l: number;
}

/**
 * Converts HTML to Markdown using Turndown Service.
 * @public
 */
export function htmlToMarkdown(html: string): string;

/**
 * @public
 */
export interface Instruction {
    /** @public */
    command: string;
    /** @public */
    purpose: string;
}

/**
 * @public
 */
export interface ISuggestOwner<T> {
    /**
     * Render the suggestion item into DOM.
     * @public
     */
    renderSuggestion(value: T, el: HTMLElement): void;
    /**
     * Called when the user makes a selection.
     * @public
     */
    selectSuggestion(value: T, evt: MouseEvent | KeyboardEvent): void;

}

/**
 * @public
 */
export abstract class ItemView extends View {

    /** @public */
    contentEl: HTMLElement;

    /**
     * @public
     */
    constructor(leaf: WorkspaceLeaf);

    /**
     * @public
     */
    addAction(icon: string, title: string, callback: (evt: MouseEvent) => any, size?: number): HTMLElement;

}

/**
 * Iterate links and embeds. If callback returns true, the iteration process will be interrupted.
 * @returns true if callback ever returns true, false otherwise.
 * @public
 */
export function iterateCacheRefs(cache: CachedMetadata, cb: (ref: ReferenceCache) => boolean | void): boolean;

/**
 * @returns true if callback ever returns true, false otherwise.
 * @public
 */
export function iterateRefs(refs: ReferenceCache[], cb: (ref: ReferenceCache) => boolean | void): boolean;

/** @public */
export class Keymap {

    /** @public */
    pushScope(scope: Scope): void;
    /** @public */
    popScope(scope: Scope): void;

    /**
     * Checks whether the modifier key is pressed during this event
     * @public
     */
    static isModifier(evt: MouseEvent | TouchEvent | KeyboardEvent, modifier: Modifier): boolean;

    /**
     * Translates an event into the type of pane that should open.
     * Returns 'tab' if the modifier key Cmd/Ctrl is pressed OR if this is a middle-click MouseEvent.
     * Returns 'split' if Cmd/Ctrl+Alt is pressed.
     * Returns 'window' if Cmd/Ctrl+Alt+Shift is pressed.
     * @public
     * */
    static isModEvent(evt?: UserEvent | null): PaneType | boolean;
}

/**
 * @public
 */
export interface KeymapContext extends KeymapInfo {
    /** @public */
    vkey: string;
}

/**
 * @public
 */
export interface KeymapEventHandler extends KeymapInfo {
    /** @public */
    scope: Scope;

}

/**
 * Return `false` to automatically preventDefault
 * @public
 */
export type KeymapEventListener = (evt: KeyboardEvent, ctx: KeymapContext) => false | any;

/**
 * @public
 */
export interface KeymapInfo {
    /** @public */
    modifiers: string | null;
    /** @public */
    key: string | null;
}

/**
 * @public
 */
export interface LinkCache extends ReferenceCache {
}

/**
 * @public
 */
export interface ListedFiles {
    /** @public */
    files: string[];
    /** @public */
    folders: string[];
}

/**
 * @public
 */
export interface ListItemCache extends CacheItem {
    /**
     * The block ID of this list item, if defined.
     * @public
     */
    id?: string | undefined;
    /**
     * A single character indicating the checked status of a task.
     * The space character `' '` is interpreted as an incomplete task.
     * An other character is interpreted as completed task.
     * `undefined` if this item isn't a task.
     * @public
     */
    task?: string | undefined;
    /**
     * Line number of the parent list item (position.start.line).
     * If this item has no parent (e.g. it's a root level list),
     * then this value is the negative of the line number of the first list item (start of the list).
     *
     * Can be used to deduce which list items belongs to the same group (item1.parent === item2.parent).
     * Can be used to reconstruct hierarchy information (parentItem.position.start.line === childItem.parent).
     * @public
     */
    parent: number;
}

/**
 * @public
 */
export interface LivePreviewState {
    /**
     * True if the left mouse is currently held down in the editor
     * (for example, when drag-to-select text).
     * @public
     */
    mousedown: boolean;
}

/**
 * @public
 */
export const livePreviewState: ViewPlugin<LivePreviewState>;

/**
 * Load MathJax.
 * @public
 */
export function loadMathJax(): Promise<void>;

/**
 * Load Mermaid and return a promise to the global mermaid object.
 * Can also use `mermaid` after this promise resolves to get the same reference.
 * @public
 */
export function loadMermaid(): Promise<any>;

/**
 * Load PDF.js and return a promise to the global pdfjsLib object.
 * Can also use `window.pdfjsLib` after this promise resolves to get the same reference.
 * @public
 */
export function loadPdfJs(): Promise<any>;

/**
 * Load Prism.js and return a promise to the global Prism object.
 * Can also use `Prism` after this promise resolves to get the same reference.
 * @public
 */
export function loadPrism(): Promise<any>;

/**
 * @public
 */
export interface Loc {
    /**
     * @public
     */
    line: number;
    /**
     * @public
     */
    col: number;
    /**
     * @public
     */
    offset: number;
}

/**
 * This is the editor for Obsidian Mobile as well as the upcoming WYSIWYG editor.
 * @public
 */
export class MarkdownEditView implements MarkdownSubView, HoverParent, MarkdownFileInfo {

    /** @public */
    app: App;

    /** @public */
    hoverPopover: HoverPopover;

    /**
     * @public
     */
    constructor(view: MarkdownView);

    /**
     * @public
     */
    clear(): void;
    /**
     * @public
     */
    get(): string;
    /**
     * @public
     */
    set(data: string, clear: boolean): void;

    /** @public */
    get file(): TFile;

    /**
     * @public
     */
    getSelection(): string;

    /**
     * @public
     */
    getScroll(): number;
    /**
     * @public
     */
    applyScroll(scroll: number): void;

}

/**
 * @public
 */
export interface MarkdownFileInfo extends HoverParent {
    /**
     * @public
     */
    app: App;
    /**
     * @public
     */
    get file(): TFile;
    /**
     * @public
     */
    editor?: Editor;
}

/**
 * A post processor receives an element which is a section of the preview.
 *
 * Post processors can mutate the DOM to render various things, such as mermaid graphs, latex equations, or custom controls.
 *
 * If your post processor requires lifecycle management, for example, to clear an interval, kill a subprocess, etc when this element is
 * removed from the app, look into {@link MarkdownPostProcessorContext#addChild}
 * @public
 */
export interface MarkdownPostProcessor {
    /**
     * The processor function itself.
     * @public
     */
    (el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<any> | void;
    /**
     * An optional integer sort order. Defaults to 0. Lower number runs before higher numbers.
     * @public
     */
    sortOrder?: number;
}

/**
 * @public
 */
export interface MarkdownPostProcessorContext {
    /**
     * @public
     */
    docId: string;
    /** @public */
    sourcePath: string;
    /** @public */
    frontmatter: any | null | undefined;

    /**
     * Adds a child component that will have its lifecycle managed by the renderer.
     *
     * Use this to add a dependent child to the renderer such that if the containerEl
     * of the child is ever removed, the component's unload will be called.
     * @public
     */
    addChild(child: MarkdownRenderChild): void;
    /**
     * Gets the section information of this element at this point in time.
     * Only call this function right before you need this information to get the most up-to-date version.
     * This function may also return null in many circumstances; if you use it, you must be prepared to deal with nulls.
     * @public
     */
    getSectionInfo(el: HTMLElement): MarkdownSectionInformation | null;

}

/** @public **/
export interface MarkdownPreviewEvents extends Component {

}

/**
 * @public
 */
export class MarkdownPreviewRenderer {

    /**
     * @public
     */
    static registerPostProcessor(postProcessor: MarkdownPostProcessor, sortOrder?: number): void;
    /**
     * @public
     */
    static unregisterPostProcessor(postProcessor: MarkdownPostProcessor): void;

    /**
     * @public
     */
    static createCodeBlockPostProcessor(language: string, handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void): (el: HTMLElement, ctx: MarkdownPostProcessorContext) => void;

}

/**
 * @public
 */
export class MarkdownPreviewView extends MarkdownRenderer implements MarkdownSubView, MarkdownPreviewEvents {

    /**
     * @public
     */
    containerEl: HTMLElement;

    /**
     * @public
     */
    get file(): TFile;

    /**
     * @public
     */
    get(): string;
    /**
     * @public
     */
    set(data: string, clear: boolean): void;
    /**
     * @public
     */
    clear(): void;

    /**
     * @public
     */
    rerender(full?: boolean): void;

    /**
     * @public
     */
    getScroll(): number;
    /**
     * @public
     */
    applyScroll(scroll: number): void;

}

/**
 * @public
 */
export class MarkdownRenderChild extends Component {
    /** @public */
    containerEl: HTMLElement;
    /**
     * @param containerEl - This HTMLElement will be used to test whether this component is still alive.
     * It should be a child of the markdown preview sections, and when it's no longer attached
     * (for example, when it is replaced with a new version because the user edited the markdown source code),
     * this component will be unloaded.
     * @public
     */
    constructor(containerEl: HTMLElement);
}

/**
 * @public
 */
export abstract class MarkdownRenderer extends MarkdownRenderChild implements MarkdownPreviewEvents, HoverParent, MarkdownFileInfo {
    /** @public */
    app: App;

    /** @public */
    hoverPopover: HoverPopover;

    /** @public */
    abstract get file(): TFile;

    /**
     * Renders markdown string to an HTML element.
     * @param markdown - The markdown source code
     * @param el - The element to append to
     * @param sourcePath - The normalized path of this markdown file, used to resolve relative internal links
     * @param component - A parent component to manage the lifecycle of the rendered child components, if any
     * @public
     */
    static renderMarkdown(markdown: string, el: HTMLElement, sourcePath: string, component: Component): Promise<void>;
}

/** @public */
export interface MarkdownSectionInformation {
    /** @public */
    text: string;
    /** @public */
    lineStart: number;
    /** @public */
    lineEnd: number;
}

/**
 * @public
 */
export class MarkdownSourceView implements MarkdownSubView, HoverParent, MarkdownFileInfo {

    /** @public */
    app: App;
    /**
     * @deprecated - Please use {@link MarkdownView#editor} instead.
     * If you have to use this because you're augmenting specific CodeMirror 5 implementations,
     * be aware that it will only work in source code mode on the desktop app, and it will
     * not work on Mobile, or once WYSIWYG mode is released.
     * @public
     */
    cmEditor: CodeMirror.Editor;

    /** @public */
    hoverPopover: HoverPopover;

    /**
     * @public
     */
    constructor(view: MarkdownView);

    /**
     * @public
     */
    clear(): void;
    /**
     * @public
     */
    get(): string;
    /**
     * @public
     */
    set(data: string, clear: boolean): void;

    /** @public */
    get file(): TFile;

    /**
     * @public
     */
    getSelection(): string;

    /**
     * @public
     */
    getScroll(): number;
    /**
     * @public
     */
    applyScroll(scroll: number): void;

}

/**
 * @public
 */
export interface MarkdownSubView {

    /**
     * @public
     */
    getScroll(): number;
    /**
     * @public
     */
    applyScroll(scroll: number): void;

    /**
     * @public
     */
    get(): string;
    /**
     * @public
     */
    set(data: string, clear: boolean): void;

}

/**
 * @public
 */
export class MarkdownView extends TextFileView {

    /**
     * @public
     */
    editor: Editor;

    /**
     * @public
     */
    previewMode: MarkdownPreviewView;

    /**
     * @public
     */
    currentMode: MarkdownSubView;

    /**
     * @public
     */
    constructor(leaf: WorkspaceLeaf);

    /**
     * @public
     */
    getViewType(): string;

    /**
     * @public
     */
    getMode(): MarkdownViewModeType;

    /**
     * @public
     */
    getViewData(): string;
    /**
     * @public
     */
    clear(): void;

    /**
     * @public
     */
    setViewData(data: string, clear: boolean): void;

    /**
     * @public
     */
    showSearch(replace?: boolean): void;

}

/**
 * @public
 */
export type MarkdownViewModeType = 'source' | 'preview';

/**
 * @public
 */
export class Menu extends Component {

    /**
     * @public
     */
    constructor();

    /**
     * @public
     */
    setNoIcon(): this;
    /**
     * Force this menu to use native or DOM.
     * (Only works on the desktop app)
     * @public
     */
    setUseNativeMenu(useNativeMenu: boolean): this;
    /**
     * Adds a menu item. Only works when menu is not shown yet.
     * @public
     */
    addItem(cb: (item: MenuItem) => any): this;
    /**
     * Adds a separator. Only works when menu is not shown yet.
     * @public
     */
    addSeparator(): this;

    /**
     * @public
     */
    showAtMouseEvent(evt: MouseEvent): this;
    /**
     * @public
     */
    showAtPosition(position: Point, doc?: Document): this;
    /**
     * @public
     */
    hide(): this;
    /**
     * @public
     */
    onHide(callback: () => any): void;

}

/**
 * @public
 */
export class MenuItem {

    /**
     * Private constructor. Use {@link Menu.addItem} instead.
     * @public
     */
    private constructor();
    /**
     * @public
     */
    setTitle(title: string | DocumentFragment): this;
    /**
     * @public
     */
    setIcon(icon: string | null, size?: number): this;

    /**
     * @public
     */
    setChecked(checked: boolean | null): this;
    /**
     * @public
     */
    setDisabled(disabled: boolean): this;

    /**
     * @public
     */
    setIsLabel(isLabel: boolean): this;

    /**
     * @public
     */
    onClick(callback: (evt: MouseEvent | KeyboardEvent) => any): this;

    /**
     * Sets the section this menu item should belong in.
     * To find the section IDs of an existing menu, inspect the DOM elements
     * to see their `data-section` attribute.
     * @public
     */
    setSection(section: string): this;

}

/**
 * @public
 */
export class MenuSeparator {

}

/**
 *
 * Linktext is any internal link that is composed of a path and a subpath, such as "My note#Heading"
 * Linkpath (or path) is the path part of a linktext
 * Subpath is the heading/block ID part of a linktext.
 *
 * @public
 */
export class MetadataCache extends Events {

    /**
     * Get the best match for a linkpath.
     * @public
     */
    getFirstLinkpathDest(linkpath: string, sourcePath: string): TFile | null;

    /**
     * @public
     */
    getFileCache(file: TFile): CachedMetadata | null;
    /**
     * @public
     */
    getCache(path: string): CachedMetadata | null;

    /**
     * Generates a linktext for a file.
     *
     * If file name is unique, use the filename.
     * If not unique, use full path.
     * @public
     */
    fileToLinktext(file: TFile, sourcePath: string, omitMdExtension?: boolean): string;

    /**
     * Contains all resolved links. This object maps each source file's path to an object of destination file paths with the link count.
     * Source and destination paths are all vault absolute paths that comes from `TFile.path` and can be used with `Vault.getAbstractFileByPath(path)`.
     * @public
     */
    resolvedLinks: Record<string, Record<string, number>>;
    /**
     * Contains all unresolved links. This object maps each source file to an object of unknown destinations with count.
     * Source paths are all vault absolute paths, similar to `resolvedLinks`.
     * @public
     */
    unresolvedLinks: Record<string, Record<string, number>>;

    /**
     * Called when a file has been indexed, and its (updated) cache is now available.
     *
     * Note: This is not called when a file is renamed for performance reasons.
     * You must hook the vault rename event for those.
     * (Details: https://github.com/obsidianmd/obsidian-api/issues/77)
     * @public
     */
    on(name: 'changed', callback: (file: TFile, data: string, cache: CachedMetadata) => any, ctx?: any): EventRef;
    /**
     * Called when a file has been deleted. A best-effort previous version of the cached metadata is presented,
     * but it could be null in case the file was not successfully cached previously.
     * @public
     */
    on(name: 'deleted', callback: (file: TFile, prevCache: CachedMetadata | null) => any, ctx?: any): EventRef;

    /**
     * Called when a file has been resolved for `resolvedLinks` and `unresolvedLinks`.
     * This happens sometimes after a file has been indexed.
     * @public
     */
    on(name: 'resolve', callback: (file: TFile) => any, ctx?: any): EventRef;
    /**
     * Called when all files has been resolved. This will be fired each time files get modified after the initial load.
     * @public
     */
    on(name: 'resolved', callback: () => any, ctx?: any): EventRef;
}

/**
 * @public
 */
export class Modal implements CloseableComponent {
    /**
     * @public
     */
    app: App;
    /**
     * @public
     */
    scope: Scope;
    /**
     * @public
     */
    containerEl: HTMLElement;
    /**
     * @public
     */
    modalEl: HTMLElement;
    /**
     * @public
     */
    titleEl: HTMLElement;
    /**
     * @public
     */
    contentEl: HTMLElement;

    /**
     * @public
     */
    shouldRestoreSelection: boolean;

    /**
     * @public
     */
    constructor(app: App);
    /**
     * @public
     */
    open(): void;
    /**
     * @public
     */
    close(): void;
    /**
     * @public
     */
    onOpen(): void;
    /**
     * @public
     */
    onClose(): void;

}

/**
 * Mod = Cmd on MacOS and Ctrl on other OS
 * Ctrl = Ctrl key for every OS
 * Meta = Cmd on MacOS and Win key on other OS
 * @public
 */
export type Modifier = 'Mod' | 'Ctrl' | 'Meta' | 'Shift' | 'Alt';

/** @public */
export const moment_2: typeof Moment;
export { moment_2 as moment }

/**
 * @public
 */
export class MomentFormatComponent extends TextComponent {
    /**
     * @public
     */
    sampleEl: HTMLElement;

    /**
     * Sets the default format when input is cleared. Also used for placeholder.
     * @public
     */
    setDefaultFormat(defaultFormat: string): this;
    /**
     * @public
     */
    setSampleEl(sampleEl: HTMLElement): this;
    /**
     * @public
     */
    setValue(value: string): this;
    /**
     * @public
     */
    onChanged(): void;
    /**
     * @public
     */
    updateSample(): void;
}

/**
 * @public
 */
export function normalizePath(path: string): string;

/**
 * @public
 */
export class Notice {

    /**
     * @public
     */
    constructor(message: string | DocumentFragment, timeout?: number);
    /**
     * Change the message of this notice.
     * @public
     */
    setMessage(message: string | DocumentFragment): this;
    /**
     * @public
     */
    hide(): void;
}

/**
 * @public
 */
export interface ObsidianProtocolData {
    /** @public */
    action: string;
    /** @public */
    [key: string]: string;
}

/**
 * @public
 */
export type ObsidianProtocolHandler = (params: ObsidianProtocolData) => any;

/**
 * @public
 */
export interface OpenViewState {
    /** @public */
    state?: any;
    /** @public */
    eState?: any;
    /** @public */
    active?: boolean;
    /** @public */
    group?: WorkspaceLeaf;
}

/**
 * @public
 */
export type PaneType = 'tab' | 'split' | 'window';

/**
 * @public
 */
export function parseFrontMatterAliases(frontmatter: any | null): string[] | null;

/**
 * @public
 */
export function parseFrontMatterEntry(frontmatter: any | null, key: string | RegExp): any | null;

/**
 * @public
 */
export function parseFrontMatterStringArray(frontmatter: any | null, key: string | RegExp, nospaces?: boolean): string[] | null;

/**
 * @public
 */
export function parseFrontMatterTags(frontmatter: any | null): string[] | null;

/**
 * @public
 */
export function parseLinktext(linktext: string): {
    /**
     * @public
     */
    path: string;
    /**
     * @public
     */
    subpath: string;
};

/** @public */
export function parseYaml(yaml: string): any;

/** @public */
export const Platform: {
    /**
     * The UI is in desktop mode.
     * @public
     */
    isDesktop: boolean;
    /**
     * The UI is in mobile mode.
     * @public
     */
    isMobile: boolean;
    /**
     * We're running the electron-based desktop app.
     * @public
     */
    isDesktopApp: boolean;
    /**
     * We're running the capacitor-js mobile app.
     * @public
     */
    isMobileApp: boolean;
    /**
     * We're running the iOS app.
     * @public
     */
    isIosApp: boolean;
    /**
     * We're running the Android app.
     * @public
     */
    isAndroidApp: boolean;

    /**
     * We're on a macOS device, or a device that pretends to be one (like iPhones and iPads).
     * Typically used to detect whether to use command-based hotkeys vs ctrl-based hotkeys.
     * @public
     */
    isMacOS: boolean;
    /**
     * We're running in Safari.
     * Typically used to provide workarounds for Safari bugs.
     * @public
     */
    isSafari: boolean;
};

/**
 * @public
 */
export abstract class Plugin_2 extends Component {
    /**
     * @public
     */
    app: App;
    /**
     * @public
     */
    manifest: PluginManifest;
    /**
     * @public
     */
    constructor(app: App, manifest: PluginManifest);
    /**
     * Adds a ribbon icon to the left bar.
     * @param icon - The icon name to be used. See {@link addIcon}
     * @param title - The title to be displayed in the tooltip.
     * @param callback - The `click` callback.
     * @public
     */
    addRibbonIcon(icon: string, title: string, callback: (evt: MouseEvent) => any): HTMLElement;
    /**
     * @public
     */
    addStatusBarItem(): HTMLElement;
    /**
     * Register a command globally. The command id and name will be automatically prefixed with this plugin's id and name.
     * @public
     */
    addCommand(command: Command): Command;
    /**
     * @public
     */
    addSettingTab(settingTab: PluginSettingTab): void;
    /**
     * @public
     */
    registerView(type: string, viewCreator: ViewCreator): void;
    /**
     * @public
     */
    registerExtensions(extensions: string[], viewType: string): void;
    /**
     * @public
     */
    registerMarkdownPostProcessor(postProcessor: MarkdownPostProcessor, sortOrder?: number): MarkdownPostProcessor;
    /**
     * Register a special post processor that handles fenced code given a language and a handler.
     * This special post processor takes care of removing the <pre><code> and create a <div> that
     * will be passed to your handler, and is expected to be filled with your custom elements.
     * @public
     */
    registerMarkdownCodeBlockProcessor(language: string, handler: (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => Promise<any> | void, sortOrder?: number): MarkdownPostProcessor;
    /**
     * Runs callback on all currently loaded instances of CodeMirror,
     * then registers the callback for all future CodeMirror instances.
     * @public
     */
    registerCodeMirror(callback: (cm: CodeMirror.Editor) => any): void;
    /**
     * Registers a CodeMirror 6 extension.
     * To reconfigure cm6 extensions for your plugin on the fly, you can pass an array here and dynamically
     * modify it. Once this array is modified, call `Workspace.updateOptions()` to have the changes applied.
     * @param extension - must be a CodeMirror 6 `Extension`, or an array of Extensions.
     * @public
     */
    registerEditorExtension(extension: Extension): void;
    /**
     * Register a handler for obsidian:// URLs.
     * @param action - the action string. For example, "open" corresponds to `obsidian://open`.
     * @param handler - the callback to trigger. You will be passed the key-value pair that is decoded from the query.
     *                  For example, `obsidian://open?key=value` would generate `{"action": "open", "key": "value"}`.
     * @public
     */
    registerObsidianProtocolHandler(action: string, handler: ObsidianProtocolHandler): void;
    /**
     * Register an EditorSuggest which can provide live suggestions while the user is typing.
     * @public
     */
    registerEditorSuggest(editorSuggest: EditorSuggest<any>): void;
    /**
     * @public
     */
    loadData(): Promise<any>;
    /**
     * @public
     */
    saveData(data: any): Promise<void>;

}
export { Plugin_2 as Plugin }

/**
 * @public
 */
export interface PluginManifest {
    /**
     * @public
     */
    dir?: string;
    /**
     * @public
     */
    id: string;
    /**
     * @public
     */
    name: string;
    /**
     * @public
     */
    author: string;
    /**
     * @public
     */
    version: string;
    /**
     * @public
     */
    minAppVersion: string;
    /**
     * @public
     */
    description: string;
    /**
     * @public
     */
    authorUrl?: string;
    /**
     * @public
     */
    isDesktopOnly?: boolean;
}

/**
 * @public
 */
export abstract class PluginSettingTab extends SettingTab {

    /**
     * @public
     */
    constructor(app: App, plugin: Plugin_2);
}

/**
 * @public
 */
export interface Point {
    /**
     * @public
     */
    x: number;
    /**
     * @public
     */
    y: number;
}

/**
 * @public
 */
export enum PopoverState {

}

/** @public */
export abstract class PopoverSuggest<T> implements ISuggestOwner<T>, CloseableComponent {

    /** @public */
    constructor(app: App, scope?: Scope);
    /** @public */
    open(): void;
    /** @public */
    close(): void;

    /**
     * @inheritDoc
     * @public
     */
    abstract renderSuggestion(value: T, el: HTMLElement): void;
    /**
     * @inheritDoc
     * @public
     */
    abstract selectSuggestion(value: T, evt: MouseEvent | KeyboardEvent): void;
}

/**
 * @public
 */
export interface Pos {
    /**
     * @public
     */
    start: Loc;
    /**
     * @public
     */
    end: Loc;
}

/**
 * @public
 */
export interface PreparedQuery {
    /** @public */
    query: string;
    /** @public */
    tokens: string[];
    /** @public */
    fuzzy: string[];
}

/**
 * Construct a fuzzy search callback that runs on a target string.
 * Performance may be an issue if you are running the search for more than a few thousand times.
 * If performance is a problem, consider using `prepareSimpleSearch` instead.
 * @param query - the fuzzy query.
 * @return fn - the callback function to apply the search on.
 * @public
 */
export function prepareFuzzySearch(query: string): (text: string) => SearchResult | null;

/**
 * @public
 */
export function prepareQuery(query: string): PreparedQuery;

/**
 * Construct a simple search callback that runs on a target string.
 * @param query - the space-separated words
 * @return fn - the callback function to apply the search on
 * @public
 */
export function prepareSimpleSearch(query: string): (text: string) => SearchResult | null;

/**
 * @public
 */
export interface Rect {
    /**
     * @public
     */
    x: number;
    /**
     * @public
     */
    y: number;
    /**
     * @public
     */
    width: number;
    /**
     * @public
     */
    height: number;
}

/**
 * @public
 */
export interface ReferenceCache extends CacheItem {
    /**
     * @public
     */
    link: string;
    /**
     * @public
     */
    original: string;
    /**
     * if title is different than link text, in the case of [[page name|display name]]
     * @public
     */
    displayText?: string;
}

/**
 * @public
 */
export function renderMatches(el: HTMLElement | DocumentFragment, text: string, matches: SearchMatches | null, offset?: number): void;

/**
 * Render some LaTeX math using the MathJax engine. Returns an HTMLElement.
 * Requires calling `finishRenderMath` when rendering is all done to flush the MathJax stylesheet.
 * @public
 */
export function renderMath(source: string, display: boolean): HTMLElement;

/**
 * @public
 */
export function renderResults(el: HTMLElement, text: string, result: SearchResult, offset?: number): void;

/**
 * Similar to `fetch()`, request a URL using HTTP/HTTPS, without any CORS restrictions.
 * Returns the text value of the response.
 * @public
 */
export function request(request: RequestUrlParam | string): Promise<string>;

/**
 * Similar to `fetch()`, request a URL using HTTP/HTTPS, without any CORS restrictions.
 * @public
 */
export function requestUrl(request: RequestUrlParam | string): RequestUrlResponsePromise;

/** @public */
export interface RequestUrlParam {
    /** @public */
    url: string;
    /** @public */
    method?: string;
    /** @public */
    contentType?: string;
    /** @public */
    body?: string | ArrayBuffer;
    /** @public */
    headers?: Record<string, string>;
    /**
     * Whether to throw an error when the status code is >= 400
     * Defaults to true
     * @public
     */
    throw?: boolean;
}

/** @public */
export interface RequestUrlResponse {
    /** @public */
    status: number;
    /** @public */
    headers: Record<string, string>;
    /** @public */
    arrayBuffer: ArrayBuffer;
    /** @public */
    json: any;
    /** @public */
    text: string;
}

/** @public */
export interface RequestUrlResponsePromise extends Promise<RequestUrlResponse> {
    /** @public */
    arrayBuffer: Promise<ArrayBuffer>;
    /** @public */
    json: Promise<any>;
    /** @public */
    text: Promise<string>;
}

/**
 * Returns true if the API version is equal or higher than the requested version.
 * Use this to limit functionality that require specific API versions to avoid
 * crashing on older Obsidian builds.
 * @public
 */
export function requireApiVersion(version: string): boolean;

/**
 * @public
 */
export function resolveSubpath(cache: CachedMetadata, subpath: string): HeadingSubpathResult | BlockSubpathResult;

/**
 * @public
 */
export interface RGB {
    /**
     * Red integer value between 0 and 255
     * @public
     */
    r: number;
    /**
     * Green integer value between 0 and 255
     * @public
     */
    g: number;
    /**
     * Blue integer value between 0 and 255
     * @public
     */
    b: number;
}

/** @public */
export function sanitizeHTMLToDom(html: string): DocumentFragment;

/**
 * @public
 */
export class Scope {

    /**
     * @public
     */
    constructor(parent?: Scope);

    /**
     * @public
     * @param modifiers - `Mod`, `Ctrl`, `Meta`, `Shift`, or `Alt`. `Mod` translates to `Meta` on macOS and `Ctrl` otherwise.
     * @param key - Keycode from https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
     * @param func - the callback
     */
    register(modifiers: Modifier[], key: string | null, func: KeymapEventListener): KeymapEventHandler;
    /**
     * @public
     */
    unregister(handler: KeymapEventHandler): void;

}

/**
 * @public
 */
export class SearchComponent extends AbstractTextComponent<HTMLInputElement> {
    /**
     * @public
     */
    clearButtonEl: HTMLElement;

    /**
     * @public
     */
    constructor(containerEl: HTMLElement);
    /**
     * @public
     */
    onChanged(): void;

}

/**
 * @public
 */
export type SearchMatches = SearchMatchPart[];

/**
 * @public
 */
export type SearchMatchPart = [number, number];

/**
 * @public
 */
export interface SearchResult {
    /** @public */
    score: number;
    /** @public */
    matches: SearchMatches;
}

/**
 * @public
 */
export interface SearchResultContainer {
    /** @public */
    match: SearchResult;
}

/**
 * @public
 */
export interface SectionCache extends CacheItem {
    /**
     * The block ID of this section, if defined.
     * @public
     */
    id?: string | undefined;
    /**
     * The type string generated by the parser.
     * @public
     */
    type: string;
}

/**
 * Insert an SVG into the element from an iconId. Does nothing if no icon associated with the iconId.
 * @param parent - the HTML element to insert the icon
 * @param iconId - the icon ID
 * @param size - the pixel size for width and height, defaults to 16
 * @public
 */
export function setIcon(parent: HTMLElement, iconId: string, size?: number): void;

/**
 * @public
 */
export class Setting {
    /** @public */
    settingEl: HTMLElement;
    /** @public */
    infoEl: HTMLElement;
    /** @public */
    nameEl: HTMLElement;
    /** @public */
    descEl: HTMLElement;
    /** @public */
    controlEl: HTMLElement;
    /** @public */
    components: BaseComponent[];
    /**
     * @public
     */
    constructor(containerEl: HTMLElement);
    /**
     * @public
     */
    setName(name: string | DocumentFragment): this;
    /**
     * @public
     */
    setDesc(desc: string | DocumentFragment): this;
    /**
     * @public
     */
    setClass(cls: string): this;
    /**
     * @public
     */
    setTooltip(tooltip: string): this;
    /**
     * @public
     */
    setHeading(): this;
    /**
     * @public
     */
    setDisabled(disabled: boolean): this;

    /**
     * @public
     */
    addButton(cb: (component: ButtonComponent) => any): this;
    /**
     * @public
     */
    addExtraButton(cb: (component: ExtraButtonComponent) => any): this;
    /**
     * @public
     */
    addToggle(cb: (component: ToggleComponent) => any): this;
    /**
     * @public
     */
    addText(cb: (component: TextComponent) => any): this;
    /**
     * @public
     */
    addSearch(cb: (component: SearchComponent) => any): this;
    /**
     * @public
     */
    addTextArea(cb: (component: TextAreaComponent) => any): this;
    /**
     * @public
     */
    addMomentFormat(cb: (component: MomentFormatComponent) => any): this;
    /**
     * @public
     */
    addDropdown(cb: (component: DropdownComponent) => any): this;
    /**
     * @public
     */
    addColorPicker(cb: (component: ColorComponent) => any): this;
    /**
     * @public
     */
    addSlider(cb: (component: SliderComponent) => any): this;
    /**
     * Facilitates chaining
     * @public
     */
    then(cb: (setting: this) => any): this;
    /**
     * @public
     */
    clear(): this;
}

/**
 * @public
 */
export abstract class SettingTab {

    /**
     * @public
     */
    app: App;

    /**
     * @public
     */
    containerEl: HTMLElement;

    /**
     * @public
     */
    abstract display(): any;
    /**
     * @public
     */
    hide(): any;
}

/**
 * @public
 */
export class SliderComponent extends ValueComponent<number> {
    /**
     * @public
     */
    sliderEl: HTMLInputElement;

    /**
     * @public
     */
    constructor(containerEl: HTMLElement);
    /**
     * @public
     */
    setDisabled(disabled: boolean): this;
    /**
     * @public
     */
    setLimits(min: number, max: number, step: number | 'any'): this;
    /**
     * @public
     */
    getValue(): number;
    /**
     * @public
     */
    setValue(value: number): this;
    /**
     * @public
     */
    getValuePretty(): string;
    /**
     * @public
     */
    setDynamicTooltip(): this;
    /**
     * @public
     */
    showTooltip(): void;
    /**
     * @public
     */
    onChange(callback: (value: number) => any): this;
}

/**
 * @public
 */
export function sortSearchResults(results: SearchResultContainer[]): void;

/**
 * @public
 */
export type SplitDirection = 'vertical' | 'horizontal';

/** @public */
export interface Stat {
    /** @public */
    type: 'file' | 'folder';
    /** @public */
    ctime: number;
    /** @public */
    mtime: number;
    /** @public */
    size: number;
}

/** @public */
export function stringifyYaml(obj: any): string;

/**
 * This function normalizes headings for link matching by stripping out special characters and shrinking consecutive spaces.
 * @public
 */
export function stripHeading(heading: string): string;

/**
 * This function prepares headings for linking. It strips out some bad combinations of special characters that could break links.
 * @public
 */
export function stripHeadingForLink(heading: string): string;

/**
 * @public
 */
export interface SubpathResult {
    /**
     * @public
     */
    start: Loc;
    /**
     * @public
     */
    end: Loc | null;
}

/**
 * @public
 */
export abstract class SuggestModal<T> extends Modal implements ISuggestOwner<T> {
    /**
     * @public
     */
    limit: number;
    /**
     * @public
     */
    emptyStateText: string;

    /**
     * @public
     */
    inputEl: HTMLInputElement;
    /**
     * @public
     */
    resultContainerEl: HTMLElement;
    /**
     * @public
     */
    constructor(app: App);
    /**
     * @public
     */
    setPlaceholder(placeholder: string): void;
    /**
     * @public
     */
    setInstructions(instructions: Instruction[]): void;

    /**
     * @public
     */
    onNoSuggestion(): void;
    /**
     * @public
     */
    selectSuggestion(value: T, evt: MouseEvent | KeyboardEvent): void;
    /**
     * @public
     */
    abstract getSuggestions(query: string): T[] | Promise<T[]>;
    /**
     * @public
     */
    abstract renderSuggestion(value: T, el: HTMLElement): any;
    /**
     * @public
     */
    abstract onChooseSuggestion(item: T, evt: MouseEvent | KeyboardEvent): any;
}

/**
 * This can be either a `TFile` or a `TFolder`.
 * @public
 */
export abstract class TAbstractFile {
    /**
     * @public
     */
    vault: Vault;
    /**
     * @public
     */
    path: string;
    /**
     * @public
     */
    name: string;
    /**
     * @public
     */
    parent: TFolder;

}

/**
 * @public
 */
export interface TagCache extends CacheItem {
    /**
     * @public
     */
    tag: string;
}

/**
 * @public
 */
export class Tasks {

    /**
     * @public
     */
    add(callback: () => Promise<any>): void;
    /**
     * @public
     */
    addPromise(promise: Promise<any>): void;
    /**
     * @public
     */
    isEmpty(): boolean;
    /**
     * @public
     */
    promise(): Promise<any>;
}

/**
 * @public
 */
export class TextAreaComponent extends AbstractTextComponent<HTMLTextAreaElement> {
    /**
     * @public
     */
    constructor(containerEl: HTMLElement);
}

/**
 * @public
 */
export class TextComponent extends AbstractTextComponent<HTMLInputElement> {
    /**
     * @public
     */
    constructor(containerEl: HTMLElement);
}

/**
 * This class implements a plaintext-based editable file view, which can be loaded and saved given an editor.
 *
 * Note that by default, this view only saves when it's closing. To implement auto-save, your editor should
 * call `this.requestSave()` when the content is changed.
 * @public
 */
export abstract class TextFileView extends EditableFileView {

    /**
     * In memory data
     * @public
     */
    data: string;
    /**
     * Debounced save in 2 seconds from now
     * @public
     */
    requestSave: () => void;

    /**
     * @public
     */
    constructor(leaf: WorkspaceLeaf);

    /**
     * @public
     */
    onUnloadFile(file: TFile): Promise<void>;
    /**
     * @public
     */
    onLoadFile(file: TFile): Promise<void>;
    /**
     * @public
     */
    save(clear?: boolean): Promise<void>;

    /**
     * Gets the data from the editor. This will be called to save the editor contents to the file.
     * @public
     */
    abstract getViewData(): string;
    /**
     * Set the data to the editor. This is used to load the file contents.
     *
     * If clear is set, then it means we're opening a completely different file.
     * In that case, you should call clear(), or implement a slightly more efficient
     * clearing mechanism given the new data to be set.
     * @public
     */
    abstract setViewData(data: string, clear: boolean): void;
    /**
     * Clear the editor. This is usually called when we're about to open a completely
     * different file, so it's best to clear any editor states like undo-redo history,
     * and any caches/indexes associated with the previous file contents.
     * @public
     */
    abstract clear(): void;
}

/**
 * @public
 */
export class TFile extends TAbstractFile {
    /**
     * @public
     */
    stat: FileStats;
    /**
     * @public
     */
    basename: string;
    /**
     * @public
     */
    extension: string;

}

/**
 * @public
 */
export class TFolder extends TAbstractFile {
    /**
     * @public
     */
    children: TAbstractFile[];

    /**
     * @public
     */
    isRoot(): boolean;

}

/**
 * @public
 */
export class ToggleComponent extends ValueComponent<boolean> {
    /**
     * @public
     */
    toggleEl: HTMLElement;

    /**
     * @public
     */
    constructor(containerEl: HTMLElement);
    /**
     * @public
     */
    setDisabled(disabled: boolean): this;
    /**
     * @public
     */
    getValue(): boolean;
    /**
     * @public
     */
    setValue(on: boolean): this;

    /**
     * @public
     */
    setTooltip(tooltip: string): this;
    /**
     * @public
     */
    onClick(): void;
    /**
     * @public
     */
    onChange(callback: (value: boolean) => any): this;
}

/** @public */
export type UserEvent = MouseEvent | KeyboardEvent | TouchEvent | PointerEvent;

/**
 * @public
 */
export abstract class ValueComponent<T> extends BaseComponent {
    /**
     * @public
     */
    registerOptionListener(listeners: Record<string, (value?: T) => T>, key: string): this;
    /**
     * @public
     */
    abstract getValue(): T;
    /**
     * @public
     */
    abstract setValue(value: T): this;
}

/**
 * @public
 */
export class Vault extends Events {
    /**
     * @public
     */
    adapter: DataAdapter;

    /**
     * Gets the path to the config folder.
     * This value is typically `.obsidian` but it could be different.
     * @public
     */
    configDir: string;

    /**
     * Gets the name of the vault
     * @public
     */
    getName(): string;

    /**
     * @public
     */
    getAbstractFileByPath(path: string): TAbstractFile | null;

    /**
     * @public
     */
    getRoot(): TFolder;

    /**
     * @public
     */
    create(path: string, data: string, options?: DataWriteOptions): Promise<TFile>;
    /**
     * @public
     */
    createBinary(path: string, data: ArrayBuffer, options?: DataWriteOptions): Promise<TFile>;
    /**
     * @public
     */
    createFolder(path: string): Promise<void>;
    /**
     * @public
     */
    read(file: TFile): Promise<string>;
    /**
     * @public
     */
    cachedRead(file: TFile): Promise<string>;
    /**
     * @public
     */
    readBinary(file: TFile): Promise<ArrayBuffer>;

    /**
     * @public
     */
    getResourcePath(file: TFile): string;
    /**
     * @param file - The file or folder to be deleted
     * @param force  - Should attempt to delete folder even if it has hidden children
     * @public
     */
    delete(file: TAbstractFile, force?: boolean): Promise<void>;
    /**
     * Tries to move to system trash. If that isn't successful/allowed, use local trash
     * @param file - The file or folder to be deleted
     * @param system - Should move to system trash
     * @public
     */
    trash(file: TAbstractFile, system: boolean): Promise<void>;
    /**
     * @public
     */
    rename(file: TAbstractFile, newPath: string): Promise<void>;
    /**
     * @public
     */
    modify(file: TFile, data: string, options?: DataWriteOptions): Promise<void>;
    /**
     * @public
     */
    modifyBinary(file: TFile, data: ArrayBuffer, options?: DataWriteOptions): Promise<void>;
    /**
     * @public
     */
    append(file: TFile, data: string, options?: DataWriteOptions): Promise<void>;
    /**
     * @public
     */
    copy(file: TFile, newPath: string): Promise<TFile>;
    /**
     * @public
     */
    getAllLoadedFiles(): TAbstractFile[];

    /**
     * @public
     */
    static recurseChildren(root: TFolder, cb: (file: TAbstractFile) => any): void;
    /**
     * @public
     */
    getMarkdownFiles(): TFile[];
    /**
     * @public
     */
    getFiles(): TFile[];

    /**
     * @public
     */
    on(name: 'create', callback: (file: TAbstractFile) => any, ctx?: any): EventRef;
    /**
     * @public
     */
    on(name: 'modify', callback: (file: TAbstractFile) => any, ctx?: any): EventRef;
    /**
     * @public
     */
    on(name: 'delete', callback: (file: TAbstractFile) => any, ctx?: any): EventRef;
    /**
     * @public
     */
    on(name: 'rename', callback: (file: TAbstractFile, oldPath: string) => any, ctx?: any): EventRef;

    /**
     * @public
     */
    on(name: 'closed', callback: () => any, ctx?: any): EventRef;

}

/**
 * @public
 */
export abstract class View extends Component {
    /**
     * @public
     */
    app: App;
    /**
     * @public
     */
    icon: string;
    /**
     * Whether or not the view is intended for navigation.
     * If your view is a static view that is not intended to be navigated away, set this to false.
     * (For example: File explorer, calendar, etc.)
     * If your view opens a file or can be otherwise navigated, set this to true.
     * (For example: Markdown editor view, Kanban view, PDF view, etc.)
     *
     * @public
     */
    navigation: boolean;
    /**
     * @public
     */
    leaf: WorkspaceLeaf;
    /**
     * @public
     */
    containerEl: HTMLElement;

    /**
     * @public
     */
    constructor(leaf: WorkspaceLeaf);

    /**
     * @public
     */
    protected onOpen(): Promise<void>;
    /**
     * @public
     */
    protected onClose(): Promise<void>;
    /**
     * @public
     */
    abstract getViewType(): string;
    /**
     * @public
     */
    getState(): any;
    /**
     * @public
     */
    setState(state: any, result: ViewStateResult): Promise<void>;
    /**
     * @public
     */
    getEphemeralState(): any;
    /**
     * @public
     */
    setEphemeralState(state: any): void;
    /**
     * @public
     */
    getIcon(): string;
    /**
     * Called when the size of this view is changed.
     * @public
     */
    onResize(): void;
    /**
     * @public
     */
    abstract getDisplayText(): string;
    /**
     * Populates the pane menu.
     *
     * (Replaces the previously removed `onHeaderMenu` and `onMoreOptionsMenu`)
     * @public
     */
    onPaneMenu(menu: Menu, source: 'more-options' | 'tab-header' | string): void;

}

/**
 * @public
 */
export type ViewCreator = (leaf: WorkspaceLeaf) => View;

/**
 * @public
 */
export interface ViewState {

    /**
     * @public
     */
    type: string;
    /**
     * @public
     */
    state?: any;
    /**
     * @public
     */
    active?: boolean;
    /**
     * @public
     */
    pinned?: boolean;
    /**
     * @public
     */
    group?: WorkspaceLeaf;
}

/**
 * @public
 */
export interface ViewStateResult {

}

/**
 * @public
 */
export class Workspace extends Events {

    /**
     * @public
     */
    leftSplit: WorkspaceSidedock | WorkspaceMobileDrawer;
    /**
     * @public
     */
    rightSplit: WorkspaceSidedock | WorkspaceMobileDrawer;
    /**
     * @public
     */
    leftRibbon: WorkspaceRibbon;
    /**
     * @public
     */
    rightRibbon: WorkspaceRibbon;
    /**
     * @public
     */
    rootSplit: WorkspaceRoot;

    /**
     * Indicates the currently focused leaf, if one exists.
     *
     * Please avoid using `activeLeaf` directly, especially without checking whether
     * `activeLeaf` is null.
     *
     * The recommended alternatives are:
     * - If you need information about the current view, use {@link getActiveViewOfType}.
     * - If you need to open a new file or navigate a view, use {@link getLeaf}.
     *
     * @public
     * @deprecated - The use of this field is discouraged.
     */
    activeLeaf: WorkspaceLeaf | null;

    /**
     * @public
     */
    containerEl: HTMLElement;
    /**
     * @public
     */
    layoutReady: boolean;
    /**
     * @public
     */
    requestSaveLayout: Debouncer<[], Promise<void>>;

    /**
     * Runs the callback function right away if layout is already ready,
     * or push it to a queue to be called later when layout is ready.
     * @public
     * */
    onLayoutReady(callback: () => any): void;
    /**
     * @public
     */
    changeLayout(workspace: any): Promise<void>;

    /**
     * @public
     */
    getLayout(): any;

    /**
     * @public
     */
    createLeafInParent(parent: WorkspaceSplit, index: number): WorkspaceLeaf;

    /**
     * @public
     */
    createLeafBySplit(leaf: WorkspaceLeaf, direction?: SplitDirection, before?: boolean): WorkspaceLeaf;
    /**
     * @public
     * @deprecated - You should use {@link getLeaf|getLeaf(true)} instead which does the same thing.
     */
    splitActiveLeaf(direction?: SplitDirection): WorkspaceLeaf;

    /**
     * @public
     */
    duplicateLeaf(leaf: WorkspaceLeaf, direction?: SplitDirection): Promise<WorkspaceLeaf>;
    /**
     * @public
     * @deprecated - You should use {@link getLeaf|getLeaf(false)} instead which does the same thing.
     */
    getUnpinnedLeaf(type?: string): WorkspaceLeaf;
    /**
     * Creates a new leaf in a leaf adjacent to the currently active leaf.
     * If direction is `'vertical'`, the leaf will appear to the right.
     * If direction is `'horizontal'`, the leaf will appear below the current leaf.
     *
     * @public
     */
    getLeaf(newLeaf?: 'split', direction?: SplitDirection): WorkspaceLeaf;
    /**
     * If newLeaf is false (or not set) then an existing leaf which can be navigated
     * is returned, or a new leaf will be created if there was no leaf available.
     *
     * If newLeaf is `'tab'` or `true` then a new leaf will be created in the preferred
     * location within the root split and returned.
     *
     * If newLeaf is `'split'` then a new leaf will be created adjacent to the currently active leaf.
     *
     * If newLeaf is `'window'` then a popout window will be created with a new leaf inside.
     *
     * @public
     */
    getLeaf(newLeaf?: PaneType | boolean): WorkspaceLeaf;

    /**
     * Migrates this leaf to a new popout window.
     * Only works on the desktop app.
     * @public
     */
    moveLeafToPopout(leaf: WorkspaceLeaf, data?: WorkspaceWindowInitData): WorkspaceWindow;

    /**
     * Open a new popout window with a single new leaf and return that leaf.
     * Only works on the desktop app.
     * @public
     */
    openPopoutLeaf(data?: WorkspaceWindowInitData): WorkspaceLeaf;
    /**
     * @public
     */
    openLinkText(linktext: string, sourcePath: string, newLeaf?: PaneType | boolean, openViewState?: OpenViewState): Promise<void>;
    /**
     * Sets the active leaf
     * @param leaf - The new active leaf
     * @param params
     * @public
     */
    setActiveLeaf(leaf: WorkspaceLeaf, params?: {
        /** @public */
        focus?: boolean;
    }): void;
    /**
     * @deprecated - function signature changed. Use other form instead
     * @public
     */
    setActiveLeaf(leaf: WorkspaceLeaf, pushHistory: boolean, focus: boolean): void;

    /**
     * @public
     */
    getLeafById(id: string): WorkspaceLeaf;
    /**
     * @public
     */
    getGroupLeaves(group: string): WorkspaceLeaf[];

    /**
     * @public
     */
    getMostRecentLeaf(root?: WorkspaceParent): WorkspaceLeaf | null;
    /**
     * @public
     */
    getLeftLeaf(split: boolean): WorkspaceLeaf;
    /**
     * @public
     */
    getRightLeaf(split: boolean): WorkspaceLeaf;

    /**
     * @public
     */
    getActiveViewOfType<T extends View>(type: Constructor<T>): T | null;

    /**
     * Returns the file for the current view if it's a FileView.
     *
     * Otherwise, it will recent the most recently active file.
     *
     * @public
     */
    getActiveFile(): TFile | null;

    /**
     * Iterate through all leaves in the main area of the workspace.
     * @public
     */
    iterateRootLeaves(callback: (leaf: WorkspaceLeaf) => any): void;
    /**
     * Iterate through all leaves, including main area leaves, floating leaves, and sidebar leaves.
     * @public
     */
    iterateAllLeaves(callback: (leaf: WorkspaceLeaf) => any): void;
    /**
     * @public
     */
    getLeavesOfType(viewType: string): WorkspaceLeaf[];
    /**
     * @public
     */
    detachLeavesOfType(viewType: string): void;

    /**
     * @public
     */
    revealLeaf(leaf: WorkspaceLeaf): void;
    /**
     * @public
     */
    getLastOpenFiles(): string[];
    /**
     * Calling this function will update/reconfigure the options of all markdown panes.
     * It is fairly expensive, so it should not be called frequently.
     * @public
     */
    updateOptions(): void;

    /**
     * @public
     */
    iterateCodeMirrors(callback: (cm: CodeMirror.Editor) => any): void;

    /**
     * @public
     */
    on(name: 'quick-preview', callback: (file: TFile, data: string) => any, ctx?: any): EventRef;
    /**
     * @public
     */
    on(name: 'resize', callback: () => any, ctx?: any): EventRef;
    /**
     * @public
     */
    on(name: 'click', callback: (evt: MouseEvent) => any, ctx?: any): EventRef;
    /**
     * @public
     */
    on(name: 'active-leaf-change', callback: (leaf: WorkspaceLeaf | null) => any, ctx?: any): EventRef;
    /**
     * @public
     */
    on(name: 'file-open', callback: (file: TFile | null) => any, ctx?: any): EventRef;

    /**
     * @public
     */
    on(name: 'layout-change', callback: () => any, ctx?: any): EventRef;
    /**
     * @public
     */
    on(name: 'window-open', callback: (win: WorkspaceWindow, window: Window) => any, ctx?: any): EventRef;
    /**
     * @public
     */
    on(name: 'window-close', callback: (win: WorkspaceWindow, window: Window) => any, ctx?: any): EventRef;
    /**
     * Triggered when the CSS of the app has changed.
     * @public
     */
    on(name: 'css-change', callback: () => any, ctx?: any): EventRef;
    /**
     * Triggered when the user opens the context menu on a file.
     * @public
     */
    on(name: 'file-menu', callback: (menu: Menu, file: TAbstractFile, source: string, leaf?: WorkspaceLeaf) => any, ctx?: any): EventRef;

    /**
     * Triggered when the user opens the context menu on an editor.
     * @public
     */
    on(name: 'editor-menu', callback: (menu: Menu, editor: Editor, view: MarkdownView) => any, ctx?: any): EventRef;
    /**
     * Triggered when changes to an editor has been applied, either programmatically or from a user event.
     * @public
     */
    on(name: 'editor-change', callback: (editor: Editor, markdownView: MarkdownView) => any, ctx?: any): EventRef;
    /**
     * Triggered when the editor receives a paste event.
     * Check for `evt.defaultPrevented` before attempting to handle this event, and return if it has been already handled.
     * Use `evt.preventDefault()` to indicate that you've handled the event.
     * @public
     */
    on(name: 'editor-paste', callback: (evt: ClipboardEvent, editor: Editor, markdownView: MarkdownView) => any, ctx?: any): EventRef;
    /**
     * Triggered when the editor receives a drop event.
     * Check for `evt.defaultPrevented` before attempting to handle this event, and return if it has been already handled.
     * Use `evt.preventDefault()` to indicate that you've handled the event.
     * @public
     */
    on(name: 'editor-drop', callback: (evt: DragEvent, editor: Editor, markdownView: MarkdownView) => any, ctx?: any): EventRef;

    /**
     * @public
     */
    on(name: 'codemirror', callback: (cm: CodeMirror.Editor) => any, ctx?: any): EventRef;

    /**
     * Triggered when the app is about to quit. Not guaranteed to actually run.
     * Perform some best effort cleanup here.
     * @public
     */
    on(name: 'quit', callback: (tasks: Tasks) => any, ctx?: any): EventRef;

}

/**
 * @public
 */
export abstract class WorkspaceContainer extends WorkspaceSplit {

    /** @public */
    abstract win: Window;
    /** @public */
    abstract doc: Document;

}

/**
 * @public
 */
export class WorkspaceFloating extends WorkspaceParent {

}

/**
 * @public
 */
export abstract class WorkspaceItem extends Events {

    /**
     * @public
     */
    getRoot(): WorkspaceItem;
    /**
     * Get the root container parent item, which can be one of:
     * - {@link WorkspaceRoot}
     * - {@link WorkspaceWindow}
     * @public
     */
    getContainer(): WorkspaceContainer;

}

/**
 * @public
 */
export class WorkspaceLeaf extends WorkspaceItem {

    /**
     * @public
     */
    view: View;

    /**
     * By default, `openFile` will also make the leaf active.
     * Pass in `{ active: false }` to override.
     *
     * @public
     */
    openFile(file: TFile, openState?: OpenViewState): Promise<void>;

    /**
     * @public
     */
    open(view: View): Promise<View>;

    /**
     * @public
     */
    getViewState(): ViewState;
    /**
     * @public
     */
    setViewState(viewState: ViewState, eState?: any): Promise<void>;

    /**
     * @public
     */
    getEphemeralState(): any;
    /**
     * @public
     */
    setEphemeralState(state: any): void;
    /**
     * @public
     */
    togglePinned(): void;
    /**
     * @public
     */
    setPinned(pinned: boolean): void;
    /**
     * @public
     */
    setGroupMember(other: WorkspaceLeaf): void;
    /**
     * @public
     */
    setGroup(group: string): void;
    /**
     * @public
     */
    detach(): void;

    /**
     * @public
     */
    getIcon(): string;
    /**
     * @public
     */
    getDisplayText(): string;

    /**
     * @public
     */
    onResize(): void;

    /**
     * @public
     */
    on(name: 'pinned-change', callback: (pinned: boolean) => any, ctx?: any): EventRef;
    /**
     * @public
     */
    on(name: 'group-change', callback: (group: string) => any, ctx?: any): EventRef;

}

/**
 * @public
 */
export class WorkspaceMobileDrawer extends WorkspaceParent {

    /** @public */
    collapsed: boolean;

    /** @public */
    expand(): void;

    /** @public */
    collapse(): void;

    /** @public */
    toggle(): void;

}

/**
 * @public
 */
export abstract class WorkspaceParent extends WorkspaceItem {

}

/**
 * @public
 */
export class WorkspaceRibbon {

}

/**
 * @public
 */
export class WorkspaceRoot extends WorkspaceContainer {
    /** @public */
    win: Window;
    /** @public */
    doc: Document;
}

/**
 * @public
 */
export class WorkspaceSidedock extends WorkspaceSplit {

    /** @public */
    collapsed: boolean;

    /** @public */
    toggle(): void;
    /** @public */
    collapse(): void;
    /** @public */
    expand(): void;

}

/**
 * @public
 */
export class WorkspaceSplit extends WorkspaceParent {

}

/**
 * @public
 */
export class WorkspaceTabs extends WorkspaceParent {

}

/**
 * @public
 */
export class WorkspaceWindow extends WorkspaceContainer {

    /** @public */
    win: Window;
    /** @public */
    doc: Document;

}

/**
 * @public
 */
export interface WorkspaceWindowInitData {

    /**
     * The suggested size
     * @public
     */
    size?: {
        /** @public */
        width: number;
        /** @public */
        height: number;
    };
}

export { }

/** @public */
declare global {
	/**
	 * Global reference to the app.
	 * @public
	 */
	var app: App;
}
