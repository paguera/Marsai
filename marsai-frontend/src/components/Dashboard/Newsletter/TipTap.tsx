import { FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import TextAlign from '@tiptap/extension-text-align';
import './styles.css';
import { useImperativeHandle, forwardRef } from 'react';

const TipTap = forwardRef((_, ref) => {

    const editor = useEditor({
        extensions: [
            StarterKit, 
            TextStyle, 
            FontFamily, 
            FontSize,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: `
        <p>Bienvenue dans votre éditeur de newsletter.</p>
      `,
        immediatelyRender: false,
    });

    const editorState = useEditorState({
        editor,
        selector: () => {
            if (editor)
                return {
                    isBold: editor.isActive('bold'),
                    isItalic: editor.isActive('italic'),
                    h1: editor.isActive('heading', { level: 1 }),
                    h2: editor.isActive('heading', { level: 2 }),
                    h3: editor.isActive('heading', { level: 3 }),
                    alignLeft: editor.isActive({ textAlign: 'left' }),
                    alignCenter: editor.isActive({ textAlign: 'center' }),
                    alignRight: editor.isActive({ textAlign: 'right' }),
                    alignJustify: editor.isActive({ textAlign: 'justify' }),
                    bulletList: editor.isActive('bulletList'),
                    orderedList: editor.isActive('orderedList'),
                }
        },
    });

    useImperativeHandle(ref, () => ({
        getHTML: () => editor?.getHTML(),
    }));


    if (!editor) return null;

    return (
        <>
            <div className="editor-container">

                <div className="control-group">
                    <div className="button-group">
                        {/* Basic Formatting */}
                        <div className="flex gap-1 mr-2 border-r border-gray-700 pr-2">
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editorState?.isBold ? 'bg-gray-700 text-primary' : 'text-white'}`}
                                title="Bold"
                            >
                                <span className="font-bold px-1">B</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editorState?.isItalic ? 'bg-gray-700 text-primary' : 'text-white'}`}
                                title="Italic"
                            >
                                <span className="italic px-1">I</span>
                            </button>
                        </div>
                        
                        {/* Alignment */}
                        <div className="flex gap-1 mr-2 border-r border-gray-700 pr-2">
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editorState?.alignLeft ? 'bg-gray-700 text-primary' : 'text-white'}`}
                                title="Align Left"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" /></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editorState?.alignCenter ? 'bg-gray-700 text-primary' : 'text-white'}`}
                                title="Align Center"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" /></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editorState?.alignRight ? 'bg-gray-700 text-primary' : 'text-white'}`}
                                title="Align Right"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" /></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editorState?.alignJustify ? 'bg-gray-700 text-primary' : 'text-white'}`}
                                title="Align Justify"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                        </div>

                        {/* Headings */}
                        <div className="flex gap-1 mr-2 border-r border-gray-700 pr-2">
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editorState?.h1 ? 'bg-gray-700 text-primary' : 'text-white font-bold'}`}
                            >
                                H1
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editorState?.h2 ? 'bg-gray-700 text-primary' : 'text-white font-bold'}`}
                            >
                                H2
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editorState?.h3 ? 'bg-gray-700 text-primary' : 'text-white font-bold'}`}
                            >
                                H3
                            </button>
                        </div>

                        {/* Lists & more */}
                        <div className="flex gap-1 mr-2 border-r border-gray-700 pr-2">
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editorState?.bulletList ? 'bg-gray-700 text-primary' : 'text-white'}`}
                                title="Bullet List"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editorState?.orderedList ? 'bg-gray-700 text-primary' : 'text-white'}`}
                                title="Ordered List"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6v.01M7 12v.01M7 18v.01M11 6h9M11 12h9M11 18h9" /></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${editor.isActive('blockquote') ? 'bg-gray-700 text-primary' : 'text-white'}`}
                                title="Blockquote"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors text-white`}
                                title="Horizontal Rule"
                            >
                                <span className="font-bold">―</span>
                            </button>
                        </div>

                        {/* Dropdowns */}
                        <div className="flex gap-2">
                            <select 
                                onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
                                className="bg-gray-800 text-white text-xs p-1 rounded border border-gray-700 outline-none hover:border-primary transition-all cursor-pointer"
                            >
                                <option value="16px">Size</option>
                                <option value="12px">12px</option>
                                <option value="16px">16px</option>
                                <option value="20px">20px</option>
                                <option value="24px">24px</option>
                                <option value="30px">30px</option>
                            </select>

                            <select 
                                onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                                className="bg-gray-800 text-white text-xs p-1 rounded border border-gray-700 outline-none hover:border-primary transition-all cursor-pointer"
                            >
                                <option value="Inter">Font</option>
                                <option value="Inter">Inter</option>
                                <option value="Arial">Arial</option>
                                <option value='"Times New Roman", Times, serif'>Times New Roman</option>
                                <option value="serif">Serif</option>
                                <option value="monospace">Monospace</option>
                                <option value='"Comic Sans MS", "Comic Sans"'>Comic Sans</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="prose prose-invert max-w-none">
                    <EditorContent editor={editor} />
                </div>

            </div>

        </>
    );
});

TipTap.displayName = 'TipTap';

export default TipTap;
