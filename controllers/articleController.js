import Article from "../models/Article.js";

export const create_article = async (req, res) => {
  try {
    console.log("jj",req.user)
    const { title, description, content, tags } = req.body.data;
    const {id ,email} = req.user
    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, description and content are required",
      });
    }

    // ✅ Create article
    const article = await Article.create({
      title,
      description,
      content,
      tags: tags || [],
      author: id,
    });

    // ✅ Response
    res.status(201).json({
      success: true,
      message: "Article created successfully",
      data: article,
    });

  } catch (error) {
    console.error("🔥 CREATE ARTICLE ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const fetch_article = async (req, res) => {
  try {
    const {
      search = "",
      tag,
      page = 1,
      limit = 6,
    } = req.query;

    const query = {};

    // 🔍 Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 🏷 Filter by tag
    if (tag) {
      query.tags = tag;
    }

    const skip = (page - 1) * limit;

    const articles = await Article.find(query)
      .sort({ createdAt: -1 }) // latest first
      .skip(skip)
      .limit(Number(limit));

    const total = await Article.countDocuments(query);

    res.json({
      articles,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const update_article = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

  
    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    if (article.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }
    const { title, description, content, tags } = req.body.data;

    article.title = title;
    article.description = description;
    article.content = content;
    article.tags = tags;

    await article.save();

    return res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: article,
    });

  } catch (err) {
    console.error('Update Article Error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};



export const delete_article = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

  

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    if (article.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this article',
      });
    }

    await Article.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });

  } catch (err) {
    console.error('Delete Article Error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


export const fetchArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required',
      });
    }

    const article = await Article.findById(id)
    .populate('author', 'name email');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: article,
    });

  } catch (err) {
    console.error('Fetch Article Error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


export const getMyArticles = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;

    const skip = (page - 1) * limit;

    const filter = { author: userId };

    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: articles,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    console.error('Get My Articles Error:', err);

    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};