// this script will assume it's being run from the `/blog` directory

import path from "path";
import fs from "fs";
import matter from "gray-matter";
import markdownit from "markdown-it";
import Handlebars from "handlebars";
import dayjs from "dayjs";

const md = markdownit();

interface PostMetadata {
  title: string;
  date: string;
  description: string;
  published: boolean;
}

interface PostmapItem {
  meta: PostMetadata;
  html: string;
  slug: string;
}

interface PostTemplateOptions {
  description: string;
  title: string;
  date: string;
  html: string;
}

interface IndexTemplateOptions {
  posts: {
    title: string;
    date: string;
    href: string;
  }[];
}

// where md posts are kept
const postsPath = path.resolve(process.cwd(), "posts");

// where html will be ouputted
const outputPath = path.resolve(process.cwd(), "html");

// template path
const templatePath = path.resolve(
  process.cwd(),
  "template",
  "post-template.hbs"
);

const indexTemplatePath = path.resolve(
  process.cwd(),
  "template",
  "post-index.hbs"
);

// main
(async () => {
  // read the template
  const templateFile = fs.readFileSync(templatePath, "utf-8");
  const indexTemplateFile = fs.readFileSync(indexTemplatePath, "utf-8");

  const template = Handlebars.compile(templateFile);
  const indexTemplate = Handlebars.compile(indexTemplateFile);

  // get the post filenames in the `posts` directory
  const postList = fs.readdirSync(postsPath);

  // create a 'postmap' for each post in the post list
  // only include published posts and sort the posts by date
  const map: PostmapItem[] = postList
    .map((fileName) => {
      const postPath = path.resolve(postsPath, fileName);
      const slug = fileName.replace(`.md`, "");
      const postFile = fs.readFileSync(postPath, "utf-8");
      const matterRes = matter(postFile);
      const meta: PostMetadata = matterRes.data as PostMetadata;

      const html = md.render(matterRes.content);

      return {
        slug,
        meta,
        html,
      };
    })
    .filter((item) => item.meta.published)
    .sort((postA, postB) => {
      const dateA = -new Date(postA.meta.date);
      const dateB = -new Date(postB.meta.date);

      return dateA - dateB;
    });

  /** Index map */
  const indexMap = map.map((item) => {
    return {
      title: item.meta.title,
      date: item.meta.date,
      href: item.slug,
    };
  });

  const indexTemplateOpts: IndexTemplateOptions = {
    posts: indexMap,
  };

  const indexHtml = indexTemplate(indexTemplateOpts);

  map.forEach((mapItem) => {
    const outputDir = path.resolve(outputPath, mapItem.slug);

    // if the output directory does not exist, create it.
    if (!fs.existsSync(path.resolve(outputPath, mapItem.slug))) {
      fs.mkdirSync(outputDir);
    }

    const formattedDate = dayjs(mapItem.meta.date).format("MMM DD, YYYY");

    const templateOptions: PostTemplateOptions = {
      description: mapItem.meta.description,
      title: mapItem.meta.title,
      date: formattedDate,
      html: mapItem.html,
    };

    const html = template(templateOptions);

    fs.writeFileSync(path.resolve(outputDir, "index.html"), html);
  });

  console.log(indexHtml);
})();
