import { Octokit } from "@octokit/rest";
import axios from "axios";
import ConfigDependency from "../models/ConfigDependency.js";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Token Github API để xác thực
});

export const crawlGitHubRepo = async (owner, repo) => {
  try {
    console.log(`Fetching content of repository: ${owner}/${repo}`);

    // Lấy danh sách file từ repo GitHub
    const { data: files } = await octokit.repos.getContent({
      owner,
      repo,
      path: "",
    });
    const dependenciesToInsert = [];

    // Kiểm tra các loại file cấu hình
    for (const file of files) {
      if (file.type === "file") {
        // Xử lý file package.json (npm)
        if (file.name === "package.json") {
          await handlePackageJson(file, dependenciesToInsert, owner, repo);
        }

        // Xử lý file pom.xml (Maven)
        if (file.name === "pom.xml") {
          await handlePomXml(file, dependenciesToInsert, owner, repo);
        }
      }
    }

    // Lưu dữ liệu vào MongoDB theo batch
    const batchSize = 50; // Kích thước batch
    for (let i = 0; i < dependenciesToInsert.length; i += batchSize) {
      const batch = dependenciesToInsert.slice(i, i + batchSize);
      try {
        await ConfigDependency.insertMany(batch, { ordered: false });
        console.log(
          `Inserted batch of ${batch.length} dependencies for repo ${owner}/${repo}.`
        );
      } catch (error) {
        console.error(`Error inserting batch: ${error.message}`);
        throw error;
      }
    }
  } catch (error) {
    console.error(
      `Error crawling repository ${owner}/${repo}: ${error.message}`
    );
    throw error;
  }
};

// Hàm xử lý package.json
const handlePackageJson = async (file, dependenciesToInsert, owner, repo) => {
  try {
    // Ghi log để thông báo rằng file package.json đang được xử lý, hiển thị URL của file
    console.log(`Processing package.json at ${file.download_url}`);

    // Sử dụng axios để tải nội dung của file package.json từ URL cung cấp
    const { data: packageJson } = await axios.get(file.download_url);

    // Tạo một đối tượng `allDependencies` để tập hợp tất cả các loại dependencies từ package.json
    const allDependencies = {
      dependencies: packageJson?.dependencies || {}, // Lấy dependencies, nếu không có thì mặc định là {}
      devDependencies: packageJson?.devDependencies || {}, // Lấy devDependencies
      peerDependencies: packageJson?.peerDependencies || {}, // Lấy peerDependencies
      optionalDependencies: packageJson?.optionalDependencies || {}, // Lấy optionalDependencies
    };

    // Kết hợp tất cả các dependencies lại với nhau và duyệt qua từng cặp [name, version]
    for (const [name, version] of Object.entries({
      ...allDependencies.dependencies,
      ...allDependencies.devDependencies,
      ...allDependencies.peerDependencies,
      ...allDependencies.optionalDependencies,
    })) {
      // Đẩy thông tin về từng dependency vào mảng `dependenciesToInsert`
      dependenciesToInsert.push({
        name, // Tên của dependency
        version, // Phiên bản của dependency
        type: "NPM", // Loại quản lý gói (ở đây là NPM)
        source: `${owner}/${repo}`, // Nguồn gốc (repo và owner của file package.json)
      });
    }
  } catch (error) {
    // Bắt lỗi nếu có sự cố trong quá trình xử lý file package.json và ghi log lỗi
    console.error(`Error processing package.json: ${error.message}`);
    throw error;
  }
};

// Hàm xử lý pom.xml (Maven)
const handlePomXml = async (file, dependenciesToInsert, owner, repo) => {
  try {
    console.log(`Processing pom.xml at ${file.download_url}`);

    // Lấy nội dung của file pom.xml
    const { data: pomXml } = await axios.get(file.download_url);

    // Regex để trích xuất dependencies từ thẻ <dependency>
    const dependencyRegex = /<dependency>([\s\S]*?)<\/dependency>/g;
    let match;

    while ((match = dependencyRegex.exec(pomXml)) !== null) {
      const dependencyBlock = match[1];

      const groupIdMatch = /<groupId>(.*?)<\/groupId>/.exec(dependencyBlock);
      const artifactIdMatch = /<artifactId>(.*?)<\/artifactId>/.exec(
        dependencyBlock
      );
      const versionMatch = /<version>(.*?)<\/version>/.exec(dependencyBlock);

      if (groupIdMatch && artifactIdMatch) {
        const groupId = groupIdMatch[1];
        const artifactId = artifactIdMatch[1];
        const version = versionMatch ? versionMatch[1] : "unknown";

        dependenciesToInsert.push({
          name: `${groupId}:${artifactId}`,
          version,
          type: "Maven", // Cập nhật type thành loại quản lý gói
          source: `${owner}/${repo}`,
        });
        console.log(
          `Extracted dependency: ${groupId}:${artifactId}:${version}`
        );
      }
    }
  } catch (error) {
    console.error(`Error processing pom.xml: ${error.message}`);
    throw error;
  }
};
