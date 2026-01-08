import { useState } from "react";
import "./assets/style.css";
// import { useEffect } from "react";
// 建立 API 設定
import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  //建立狀態管理
  const [formData, setFormData] = useState({
    username: "whchenmail@gmail.com",
    password: "",
    // ms.kl@hexschool
  });
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState();

  // 產品資料狀態
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }));
  };

  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products`
      );
      setProducts(response.data.products);
    } catch (error) {
      console.log(error.response);
    }
  };

  const onSubmit = async (e) => {
    try {
      e.preventDefault();
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      // console.log(response.data);
      const { token, expired } = response.data;
      // 設定 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(
        expired
      ).toUTCString()};`;
      axios.defaults.headers.common["Authorization"] = token;

      await getProducts();
      setIsAuth(true);
    } catch (error) {
      setIsAuth(false);
      console.log(error.response);
    }
  };

  const checkLogin = async () => {
    try {
      // 讀取 Cookie
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);
    } catch (error) {
      console.log(error.response?.data.message);
    }
  };

  // useEffect(() => {
  //   // 1. 從 Cookie 取出 Token
  //   const token = document.cookie
  //     .split("; ")
  //     .find((row) => row.startsWith("hexToken="))
  //     ?.split("=")[1];

  //   if (token) {
  //     // 2. 設定 Axios 預設 Header
  //     axios.defaults.headers.common["Authorization"] = token;

  //     // 3. 呼叫 API 檢查 Token 是否有效
  //     axios
  //       .post(`${API_BASE}/api/user/check`)
  //       .then(() => {
  //         setIsAuth(true); // 驗證成功
  //       })
  //       .catch((err) => {
  //         console.error("驗證失敗或 Token 過期", err);
  //         setIsAuth(false);
  //       });
  //   }
  // }, []);

  return (
    <>
      {!isAuth ? (
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
        <div className="container">
          {/* 已登入 */}
          <button
            className="btn btn-danger mb-5"
            type="button"
            onClick={checkLogin}
          >
            確認是否登入
          </button>
          {/* Render products list */}
          <h2>產品列表</h2>
          <div className="row">
            {products.length > 0 ? (
              products.map((product) => (
                <div className="col-md-4 mb-3" key={product.id}>
                  <div className="card h-100">
                    <img
                      src={product.imageUrl}
                      className="card-img-top"
                      alt={product.title}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{product.title}</h5>
                      <p className="card-text">{product.description}</p>
                      <p className="card-text text-primary">
                        NT$ {product.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>尚無產品資料</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
