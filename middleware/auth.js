import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const accessToken = req.cookies?.authToken;
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. No access token provided",
    });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    console.error("ACCESS TOKEN ERROR:", error.message);

    if (error.name === "TokenExpiredError") {
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Session expired. Please login again",
        });
      }

      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );

        const newAccessToken = jwt.sign(
          { id: decodedRefresh.id },
          process.env.JWT_SECRET,
          { expiresIn: "15m" }
        );

        res.cookie("authToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
        });

        req.user = decodedRefresh;

        return next();
      } catch (refreshError) {
        console.error("🔥 REFRESH TOKEN ERROR:", refreshError.message);

        return res.status(401).json({
          success: false,
          message: "Invalid refresh token. Please login again",
        });
      }
    }

    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authMiddleware;