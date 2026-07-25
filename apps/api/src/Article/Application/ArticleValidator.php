<?php

declare(strict_types=1);

namespace App\Article\Application;

use App\Shared\Application\ValidationException;

final class ArticleValidator
{
    private const CATEGORIES = ['tech', 'psychology'];

    /**
     * @param array<string, mixed> $input
     *
     * @return array{
     *   slug: string,
     *   title: string,
     *   category: string,
     *   tags: list<string>,
     *   description: string,
     *   body: array<string, mixed>,
     *   thumbnail_url: ?string,
     *   publish: bool
     * }
     */
    public function validate(array $input, bool $slugRequired): array
    {
        $errors = [];
        $slug = trim((string) ($input['slug'] ?? ''));
        $title = trim((string) ($input['title'] ?? ''));
        $category = trim((string) ($input['category'] ?? ''));
        $description = trim((string) ($input['description'] ?? ''));
        $thumbnailUrl = isset($input['thumbnail_url']) ? trim((string) $input['thumbnail_url']) : null;
        $tags = $input['tags'] ?? [];
        $body = $input['body'] ?? null;

        if ($slugRequired && !preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $slug)) {
            $errors['slug'][] = 'スラッグは小文字英数字とハイフンで入力してください';
        }
        if ($slugRequired && strlen($slug) > 100) {
            $errors['slug'][] = 'スラッグは100文字以内で入力してください';
        }
        if ($title === '' || mb_strlen($title) > 150) {
            $errors['title'][] = 'タイトルは1〜150文字で入力してください';
        }
        if (!in_array($category, self::CATEGORIES, true)) {
            $errors['category'][] = 'カテゴリーが正しくありません';
        }
        if (mb_strlen($description) > 300) {
            $errors['description'][] = '概要は300文字以内で入力してください';
        }
        if (!is_array($tags) || !array_is_list($tags)) {
            $errors['tags'][] = 'タグは配列で指定してください';
            $tags = [];
        }
        $normalizedTags = [];
        foreach ($tags as $tag) {
            if (!is_string($tag) || trim($tag) === '' || mb_strlen(trim($tag)) > 30) {
                $errors['tags'][] = '各タグは1〜30文字で入力してください';
                continue;
            }
            $normalizedTags[] = trim($tag);
        }
        $normalizedTags = array_values(array_unique($normalizedTags));
        if (count($normalizedTags) > 10) {
            $errors['tags'][] = 'タグは10件以内で指定してください';
        }
        if (!is_array($body) || array_is_list($body) || ($body['type'] ?? null) !== 'doc') {
            $errors['body'][] = '本文はTipTapのJSONドキュメントで指定してください';
            $body = ['type' => 'doc', 'content' => []];
        }
        if ($thumbnailUrl === '') {
            $thumbnailUrl = null;
        }
        if ($thumbnailUrl !== null && filter_var($thumbnailUrl, FILTER_VALIDATE_URL) === false) {
            $errors['thumbnail_url'][] = 'サムネイルURLが正しくありません';
        }
        if ($errors !== []) {
            throw new ValidationException($errors);
        }

        return [
            'slug' => $slug,
            'title' => $title,
            'category' => $category,
            'tags' => $normalizedTags,
            'description' => $description,
            'body' => $body,
            'thumbnail_url' => $thumbnailUrl,
            'publish' => (bool) ($input['publish'] ?? $input['is_publish'] ?? false),
        ];
    }
}
