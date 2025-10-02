import express from "express";
import { crawlWebsite } from "../controllers/urlCrawler.js";
import URLDependency from "../models/URLDependency.js";
import { getDependencyDetails } from "../controllers/dependencyController.js";

const router = express.Router();

// Endpoint crawl từ URL
router.post("/crawl", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      status: "error",
      message: "Url is required",
    });
  }

  try {
    await crawlWebsite(url);
    res.status(200).json({
      status: "success",
      message: `Crawling from URL ${url} completed.`,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: `Failed to crawl URL: ${url}. ${error.message}`,
    });
  }
});

// Endpoint lấy danh sách dependencies từ URL
router.post("/dependencies", async (req, res) => {
  try {
    // Lấy thông tin từ request body
    const {
      PageSize,
      PageNumber,
      SearchTerm = "",
      Filter = [],
      OrderBy = "",
      Ascending = true,
    } = req.body;

    // Kiểm tra PageSize và PageNumber
    if (!PageSize || !PageNumber || PageSize < 1 || PageNumber < 1) {
      return res.status(400).json({
        status: "error",
        message:
          "PageSize and PageNumber are required and must be greater than or equal to 1",
      });
    }

    // Điều kiện tìm kiếm và lọc
    const query = {};

    // Search theo tên hoặc source
    if (SearchTerm) {
      query.$or = [
        { name: { $regex: SearchTerm, $options: "i" } }, // Tìm kiếm theo tên
        { source: { $regex: SearchTerm, $options: "i" } }, // Tìm kiếm theo source
      ];
    }

    // Filter theo loại
    if (Filter.length > 0) {
      query.type = { $in: Filter }; // Lọc theo danh sách các loại (JavaScript, CSS, Image, etc.)
    }

    // Tính toán phân trang
    const skip = (PageNumber - 1) * PageSize;
    const limit = parseInt(PageSize, 10);

    // Sort dữ liệu
    const sortOptions = {};
    if (OrderBy) {
      const allowedFields = ["_id", "name", "type", "source"]; // Danh sách các trường được phép sắp xếp
      if (!allowedFields.includes(OrderBy)) {
        return res.status(400).json({
          status: "error",
          message: `Invalid OrderBy field. Allowed fields are: ${allowedFields.join(
            ", "
          )}`,
        });
      }
      sortOptions[OrderBy] = Ascending ? 1 : -1; // Sắp xếp tăng dần (1) hoặc giảm dần (-1)
    }

    // Lấy dữ liệu từ MongoDB với query, paging, và sort
    const dependencies = await URLDependency.find(query)
      .skip(skip)
      .limit(limit)
      .sort(sortOptions);

    // Đếm tổng số bản ghi
    const total = await URLDependency.countDocuments(query);

    // Tính toán tổng số trang và trạng thái phân trang
    const totalPages = Math.ceil(total / PageSize);
    const hasNextPage = PageNumber < totalPages;
    const hasPrevPage = PageNumber > 1;

    // Trả về kết quả
    res.status(200).json({
      status: "success",
      message: "Dependencies fetched successfully.",
      data: {
        total, // Tổng số bản ghi
        totalPages, // Tổng số trang
        currentPage: PageNumber, // Trang hiện tại
        pageSize: PageSize, // Số bản ghi mỗi trang
        hasNextPage, // Có trang tiếp theo hay không
        hasPrevPage, // Có trang trước hay không
        dependencies, // Danh sách dependencies
      },
    });
  } catch (error) {
    console.error(`Error in /url/dependencies endpoint: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: `Error fetching dependencies: ${error.message}`,
    });
  }
});

// Endpoint lấy thông tin chi tiết của dependency
router.get("/dependency/details", getDependencyDetails);

export default router;
