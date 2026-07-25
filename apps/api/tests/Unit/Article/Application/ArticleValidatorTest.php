<?php

declare(strict_types=1);

namespace Tests\Unit\Article\Application;

use App\Article\Application\ArticleValidator;
use App\Shared\Application\ValidationException;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

final class ArticleValidatorTest extends TestCase
{
    #[Test]
    public function itNormalizesAValidTiptapArticle(): void
    {
        $result = (new ArticleValidator())->validate([
            'slug' => 'serverless-php',
            'title' => ' Serverless PHP ',
            'category' => 'tech',
            'tags' => [' PHP ', 'AWS', 'PHP'],
            'description' => 'description',
            'body' => ['type' => 'doc', 'content' => []],
            'thumbnail_url' => '',
            'publish' => true,
        ], true);

        self::assertSame('Serverless PHP', $result['title']);
        self::assertSame(['PHP', 'AWS'], $result['tags']);
        self::assertNull($result['thumbnail_url']);
        self::assertTrue($result['publish']);
    }

    #[Test]
    public function itRejectsAnInvalidSlugAndBody(): void
    {
        try {
            (new ArticleValidator())->validate([
                'slug' => 'Invalid Slug',
                'title' => 'Title',
                'category' => 'tech',
                'body' => ['type' => 'html'],
            ], true);
            self::fail('ValidationException was not thrown.');
        } catch (ValidationException $exception) {
            self::assertArrayHasKey('slug', $exception->fields);
            self::assertArrayHasKey('body', $exception->fields);
        }
    }
}
