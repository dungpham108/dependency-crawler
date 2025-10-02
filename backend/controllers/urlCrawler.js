import axios from "axios";
import * as cheerio from "cheerio";
import URLDependency from "../models/URLDependency.js";

const crawlWebsite = async (url) => {
  try {
    console.log(`Crawling website: ${url}`);

    // Gửi request để lấy HTML từ URL
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Thu thập các script, stylesheet và hình ảnh
    const scripts = $("script[src]")
      .map((i, el) => $(el).attr("src"))
      .get();
    const styles = $('link[rel="stylesheet"]')
      .map((i, el) => $(el).attr("href"))
      .get();
    const images = $("img")
      .map((i, el) => $(el).attr("src"))
      .get();

    console.log(
      `Found ${scripts.length} scripts, ${styles.length} styles, and ${images.length} images.`
    );

    // Tạo danh sách dependencies
    const dependencies = [
      ...scripts.map((src) => ({ name: src, type: "JavaScript", source: url })),
      ...styles.map((href) => ({ name: href, type: "CSS", source: url })),
      ...images.map((src) => ({ name: src, type: "Image", source: url })),
    ];

    // Lưu dữ liệu theo batch
    const batchSize = 50;
    for (let i = 0; i < dependencies.length; i += batchSize) {
      const batch = dependencies.slice(i, i + batchSize);
      try {
        await URLDependency.insertMany(batch, { ordered: false });
        console.log(`Inserted batch of ${batch.length} URL dependencies.`);
      } catch (error) {
        console.error(`Error inserting batch: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Error crawling website ${url}: ${error.message}`);
  }
};

export { crawlWebsite };
