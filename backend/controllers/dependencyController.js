import ConfigDependency from "../models/ConfigDependency.js";
import axios from "axios";

// Hàm xử lý lấy chi tiết thông tin dependency
export const getDependencyDetails = async (req, res) => {
  const { name } = req.query;

  // Kiểm tra nếu tên dependency không được cung cấp
  if (!name) {
    return res.status(400).json({
      status: "error",
      message: "Dependency name is required",
    });
  }

  try {
    // Lấy thông tin từ MongoDB
    const dependencies = await ConfigDependency.find({ name });

    if (dependencies.length === 0) {
      return res.status(404).json({
        status: "error",
        message: `No information found for dependency: ${name}`,
      });
    }

    // Tạo object để chứa thông tin từ API bên ngoài
    const externalInfo = {};

    for (const dependency of dependencies) {
      // Kiểm tra loại dependency
      if (dependency.type === "NPM") {
        // Tạo URL để lấy thông tin từ NPM Registry
        const npmUrl = `https://registry.npmjs.org/${name}`;
        try {
          console.log(`Fetching NPM info for ${name}: ${npmUrl}`);

          // Gửi request đến NPM Registry để lấy thông tin về dependency
          const npmResponse = await axios.get(npmUrl);

          // Lưu các thông tin quan trọng từ NPM Registry
          externalInfo.npm = {
            description: npmResponse.data.description, // Mô tả của gói NPM
            latestVersion: npmResponse.data["dist-tags"]?.latest, // Phiên bản mới nhất
            homepage: `https://www.npmjs.com/package/${name}`, // Trang chủ của gói trên NPM
            repository: npmResponse.data.repository?.url, // URL của repository nếu có
            license: npmResponse.data.license, // Loại giấy phép (license)
          };
        } catch (npmError) {
          // Xử lý lỗi khi không thể lấy thông tin từ NPM Registry
          console.error(
            `Error fetching NPM info for ${name}:`,
            npmError.response?.data || npmError.message
          );
          throw error;
        }
      } else if (dependency.type === "Maven") {
        // Phân tích tên gói Maven thành nhóm (group) và artifact
        const [group, artifact] = name.split(":");
        // Tạo URL để lấy thông tin từ Maven Central Repository
        const mavenUrl = `https://search.maven.org/solrsearch/select?q=g:"${group}" AND a:"${artifact}"&rows=1&wt=json`;
        try {
          console.log(`Fetching Maven info for ${name}: ${mavenUrl}`);

          // Gửi request đến Maven Central Repository để lấy thông tin về dependency
          const mavenResponse = await axios.get(mavenUrl);
          const doc = mavenResponse.data.response.docs[0]; // Lấy kết quả đầu tiên (nếu có)

          if (doc) {
            // Lưu các thông tin quan trọng từ Maven Central Repository
            externalInfo.maven = {
              description: `Latest version: ${doc.latestVersion}`, // Mô tả là phiên bản mới nhất
              latestVersion: doc.latestVersion, // Phiên bản mới nhất
              homepage: `https://search.maven.org/artifact/${doc.g}/${doc.a}`, // Trang chủ của gói Maven
              license: doc.licenses?.join(", ") || "No license specified", // Giấy phép (license), nếu có
            };
          }
        } catch (mavenError) {
          // Xử lý lỗi khi không thể lấy thông tin từ Maven Central Repository
          console.error(
            `Error fetching Maven info for ${name}:`,
            mavenError.response?.data || mavenError.message
          );
          throw error;
        }
      }
    }

    // Trả về thông tin tổng hợp
    res.status(200).json({
      status: "success",
      message: `Details fetched successfully for dependency: ${name}`,
      data: {
        fromDatabase: dependencies,
        fromExternalAPI: externalInfo,
      },
    });
  } catch (error) {
    console.error(
      `Error fetching details for dependency ${name}: ${error.message}`
    );
    res.status(500).json({
      status: "error",
      message: `Error fetching details for dependency: ${name}. ${error.message}`,
    });
  }
};
