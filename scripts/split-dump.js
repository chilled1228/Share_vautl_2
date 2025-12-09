
const fs = require('fs');

const dump = JSON.parse(fs.readFileSync('firebase_dump.json', 'utf8'));

// Save users
fs.writeFileSync('dump_users.json', JSON.stringify(dump.users, null, 2));
console.log(`Saved ${dump.users.length} users to dump_users.json`);

// Split posts into chunks of 5 and generate SQL
const CHUNK_SIZE = 5;
const posts = dump.posts;

function escape(str) {
    if (!str) return '';
    return str.replace(/'/g, "''");
}

function formatArray(arr) {
    if (!arr || arr.length === 0) return "'{}'";
    const escapedItems = arr.map(item => `"${escape(item).replace(/"/g, '\\"')}"`);
    return `'${"{" + escapedItems.join(",") + "}"}'`;
    // PostgreSQL array output format: '{"tag1","tag2"}'
}

let chunkIndex = 0;
for (let i = 0; i < posts.length; i += CHUNK_SIZE) {
    const chunk = posts.slice(i, i + CHUNK_SIZE);

    let sql = `INSERT INTO public.posts (id, title, content, excerpt, slug, category, tags, featured, published, image_url, featured_image, author_id, author_name, read_time, created_at, updated_at, published_at) VALUES \n`;

    const values = chunk.map(post => {
        const authorIdSubquery = `(SELECT id FROM public.users WHERE firebase_uid = '${post.author_id_firebase}')`;
        const publishedAt = post.published_at ? `'${post.published_at}'` : 'NULL';
        const featuredImage = post.featured_image ? `'${escape(post.featured_image)}'` : 'NULL';
        const imageUrl = post.image_url ? `'${escape(post.image_url)}'` : 'NULL';
        const readTime = post.read_time ? `'${escape(post.read_time.toString())}'` : 'NULL';

        return `('${escape(post.id)}', '${escape(post.title)}', '${escape(post.content)}', '${escape(post.excerpt)}', '${escape(post.slug)}', '${escape(post.category)}', ${formatArray(post.tags)}, ${post.featured}, ${post.published}, ${imageUrl}, ${featuredImage}, ${authorIdSubquery}, '${escape(post.author_name)}', ${readTime}, '${post.created_at}', '${post.updated_at}', ${publishedAt})`;
    });

    sql += values.join(',\n');
    sql += '\nON CONFLICT (id) DO NOTHING;'; // Use ON CONFLICT to avoid duplicates if re-run

    const filename = `batch_${chunkIndex}.sql`;
    fs.writeFileSync(filename, sql);
    console.log(`Saved SQL batch to ${filename} (${chunk.length} posts)`);
    chunkIndex++;
}
