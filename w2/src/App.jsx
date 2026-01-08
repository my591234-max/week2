import { useState } from "react";
import "./assets/style.css";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // 登入表單狀態
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // 登入狀態
  const [isAuth, setIsAuth] = useState(false);

  // 產品列表 & 單一產品
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  // 表單輸入處理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }));
  };

  // 取得產品列表
  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      // setProducts(response.data.products);
      console.log("完整 API 回傳", response.data);
      console.log("products 原始型別", response.data.products);
      console.log(
        "products key 數量",
        Object.keys(response.data.products || {}).length
      );
      const productArray = Object.values(response.data.products);
      setProducts(productArray);
      // console.log("API 回傳資料-產品陣列", response.data);
    } catch (error) {
      console.log(error.response);
    }
  };

  // 登入
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;

      // 設定 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(
        expired
      ).toUTCString()};`;
      axios.defaults.headers.common["Authorization"] = token;
      console.log("登入成功，開始取得產品");

      await getProducts();
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
      console.log(error.response);
    }
  };

  // 確認登入
  const checkLogin = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];

      axios.defaults.headers.common["Authorization"] = token;
      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);
    } catch (error) {
      console.log(error.response?.data.message);
    }
  };

  return (
    <>
      {!isAuth ? (
        // ========== 登入畫面 ==========
        <div className="container login">
          <h1>請先登入</h1>
          <form className="form-floating" onSubmit={onSubmit}>
            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="username"
                id="username"
                placeholder="name@example.com"
                value={formData.username}
                onChange={handleInputChange}
                required
                autoFocus
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                name="password"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="password">Password</label>
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-2">
              登入
            </button>
          </form>
        </div>
      ) : (
        // ========== 登入後畫面 ==========
        <div className="container">
          <button
            className="btn btn-danger mb-5"
            type="button"
            onClick={checkLogin}
          >
            確認是否登入
          </button>

          <div className="row">
            {/* 左欄：產品列表 */}
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>產品名稱</th>
                    <th>原價</th>
                    <th>售價</th>
                    <th>是否啟用</th>
                    <th>查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.origin_price}</td>
                        <td>{item.price}</td>
                        <td>
                          {item.is_enabled ? (
                            <span className="text-success">啟用</span>
                          ) : (
                            <span className="text-danger">未啟用</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => setTempProduct(item)}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">尚無產品資料</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 右欄：單一產品細節 */}
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {tempProduct ? (
                <div className="card mb-3">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top primary-image"
                    alt="主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {tempProduct.title}
                      <span className="badge bg-primary ms-2">
                        {tempProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{tempProduct.description}
                    </p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      <span className="ms-2">
                        {tempProduct.price} {tempProduct.unit}
                      </span>
                    </div>
                    <h5 className="mt-3">更多圖片：</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl?.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          className="images"
                          alt={`附圖 ${index + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      className="btn btn-secondary mt-3"
                      onClick={() => setTempProduct(null)}
                    >
                      關閉
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-secondary">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
