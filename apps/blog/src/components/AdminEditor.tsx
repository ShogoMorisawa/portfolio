import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { useRef, useState } from 'react';
import Link from '@tiptap/extension-link';

// カスタムツールバー
const Menubar = ({ editor }: { editor: any }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:8000/upload_image.php', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.status === 'success' && data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert('画像のアップロードに失敗しました。' + data.error);
      }
    } catch (error) {
      alert('通信に失敗しました。ネットワークを確認してください。');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const setLink = () => {
    // 既にリンクが設定されている場合は、そのURLを初期値にする
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('リンク先のURLを入力してね👅', previousUrl);

    // キャンセルボタンが押されたら何もしない
    if (url === null) return;

    // 空文字にしてOKを押した場合は、リンクを解除する
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // リンクを設定する
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b-4 border-dashed border-[#4A4A4A] pb-4">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
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

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
      />

      <button
        onClick={setLink}
        className={`rounded-full border-4 border-[#4A4A4A] px-4 py-1 text-sm font-black transition-transform hover:-rotate-2 ${
          editor.isActive('link') ? 'bg-[#4A4A4A] text-white' : 'bg-white'
        }`}
      >
        LINK
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="rounded-full border-4 border-[#4A4A4A] bg-[#FF5757] px-4 py-1 text-sm font-black text-white transition-transform hover:-rotate-2"
      >
        📷 IMAGE
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`rounded-full border-4 border-[#4A4A4A] px-4 py-1 text-sm font-black transition-transform hover:-rotate-2 ${
          editor.isActive('codeBlock') ? 'bg-[#4A4A4A] text-[#7BE0D6]' : 'bg-white'
        }`}
      >
        CODE
      </button>
    </div>
  );
};

export default function AdminEditor() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('tech');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'border-8 border-[#4A4A4A] rounded-xl my-8 max-w-full', // Cocoスタイルの枠線！
        },
      }),
      Link.configure({
        openOnClick: false, // エディタ編集中にクリックしてもページ遷移しないようにする
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank', // デフォルトで別タブで開くようにする
        },
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'min-h-[400px] outline-none text-[#4A4A4A] text-lg leading-8 ' +
          '[&_h2]:text-2xl [&_h2]:font-black [&_h2]:border-4 [&_h2]:border-[#4A4A4A] [&_h2]:bg-[#7BE0D6] [&_h2]:px-3 [&_h2]:py-1 [&_h2]:inline-block [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:rotate-[-1deg] ' +
          '[&_p]:mb-4 [&_strong]:font-black [&_strong]:text-[#FF5757] ' +
          '[&_pre]:bg-[#4A4A4A] [&_pre]:text-[#7BE0D6] [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:border-8 [&_pre]:border-[#4A4A4A] [&_pre]:my-6 [&_pre]:font-mono [&_pre]:text-sm [&_pre]:overflow-x-auto ' +
          '[&_code]:font-mono' +
          '[&_a]:text-[#FF5757] [&_a]:font-black [&_a]:underline [&_a]:decoration-4 [&_a]:underline-offset-4 hover:[&_a]:text-[#7BE0D6]',
      },
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleSave = async () => {
    if (!editor) return;
    if (!title || !slug) {
      alert('タイトルとスラッグは必須ですよ！舌が受け付けてくれません。');
      return;
    }

    const payload = {
      title,
      slug,
      category,
      description,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean), // 空のタグを除外
      body: editor.getJSON(),
      thumbnail_url: thumbnailUrl || null,
      is_publish: true,
    };

    try {
      const res = await fetch('http://localhost:8000/save_article.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert('記事を保存しました！');
      } else {
        const errorData = await res.json();
        alert(`保存失敗: ${errorData.message || '不明なエラー'}`);
      }
    } catch {
      alert('通信に失敗しました。ネットワークを確認してください。');
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      {/* メタデータ入力エリア */}
      <div className="grid gap-6 rounded-[32px] border-8 border-[#4A4A4A] bg-white p-8">
        <input
          type="text"
          placeholder="記事のタイトル"
          value={title}
          onChange={handleTitleChange}
          className="w-full border-b-4 border-[#4A4A4A] text-3xl font-black outline-none placeholder:text-gray-300"
        />
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="slug (url-name)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="border-b-2 border-[#4A4A4A] py-2 font-mono text-sm outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="border-b-2 border-[#4A4A4A] py-2 font-black outline-none"
          >
            <option value="tech">TECH</option>
            <option value="psychology">PSYCHOLOGY</option>
          </select>
        </div>
        <textarea
          placeholder="記事の概要（一覧に出るよ）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border-b-2 border-[#4A4A4A] py-2 outline-none"
        />
      </div>

      {/* エディタ本体（ベロの質感） */}
      <div className="rounded-[44px] border-8 border-[#4A4A4A] bg-[#FF5757] p-4">
        <div className="rounded-[32px] border-8 border-[#4A4A4A] bg-[#FFF6D1] p-8">
          <Menubar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="flex justify-center">
        <button
          onClick={handleSave}
          className="rounded-full border-8 border-[#4A4A4A] bg-[#7BE0D6] px-12 py-4 text-2xl font-black tracking-widest text-[#4A4A4A] transition-all hover:-translate-y-2 hover:rotate-2 active:translate-y-0"
        >
          SAVE ARTICLE
        </button>
      </div>
    </div>
  );
}
