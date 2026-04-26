import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit'; // カスタムツールバー

// カスタムツールバー
const Menubar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b-4 border-dashed border-[#4A4A4A] pb-4">
      <button
        onClick={() => editor.chain().focus().toggleBold.run()}
        className={`rounded-full border-4 border-[#4A4A4A] px-4 py-1 text-sm font-black transition-transform hover:-rotate-2 ${
          editor.isActive('bold') ? 'bg-[#FFE36E]' : 'bg-white'
        }`}
      >
        BOLD
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`rounded-full border-4 border-[#4A4A4A] px-4 py-1 text-sm font-black transition-transform hover:-rotate-2 ${
          editor.isActive('heading', { level: 2 }) ? 'bg-[#7BE0D6]' : 'bg-white'
        }`}
      >
        H2
      </button>
    </div>
  );
};

export default function AdminEditor() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>べろべろしてやるぜ</p>',
    editorProps: {
      attributes: {
        class: 'min-h-[300px] outline-none text-[#4A4A4A] text-lg leading-8',
      },
    },
  });

  return (
    <div className="rounded-4xl border-8 border-[#4A4A4A] bg-[#FFF6D1] px-6 py-8 shadow-[8px_8px_0_0_#4A4A4A] sm:px-10">
      <Menubar editor={editor} />
      <EditorContent editor={editor} />
      //デバッグ用
      <div className="mt-10 border-t-4 border-[#4A4A4A] pt-4">
        <p className="mb-2 text-xs font-bold text-gray-500">現在のAST (JSON):</p>
        <pre className="overflow-x-auto rounded-xl bg-black p-4 text-xs text-green-400">
          {JSON.stringify(editor?.getJSON(), null, 2)}
        </pre>
      </div>
    </div>
  );
}
