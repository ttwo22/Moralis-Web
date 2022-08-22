import React, { useEffect, useState } from "react";
import { allCollections } from "../collectionsFile";
import { useNavigate } from "react-router-dom";

import moonbirds from "../images/moonbirds.png";

function Home() {
  const [inputData, setInputData] = useState("");
  const [x, setx] = useState([]);
  const navigate = useNavigate();
  const clickHandler = (col) => {
    navigate(`/${col}`);
  };
  const beinginpuit = (e) => {
    setInputData(e.target.value);
  };

  const addContract = () => {
    let collectionItem = [...allCollections];
    let res = inputData;
    if (res === "" || res.indexOf("0x", 0)) {
      setInputData("");
      alert("输入不能为空并且要为0x开头的合约地址");
    } else {
      collectionItem.push({
        name: "xxxx",
        img: moonbirds,
        slug: res,
      });
      setx(collectionItem);
      console.log(collectionItem);
      sessionStorage.setItem("collectionItem", JSON.stringify(collectionItem));
    }
  };

  useEffect(() => {
    let test = sessionStorage.getItem("collectionItem");
    if (test) {
      setx(JSON.parse(test));
    } else {
      let collectionItem = [...allCollections];
      sessionStorage.setItem("collectionItem", JSON.stringify(collectionItem));
    }
  }, []);

  return (
    <>
      <div className="top">
        <h1>顶级 NFT 收藏的鲸鱼统计数据</h1>
        <input
          type="text"
          value={inputData}
          onChange={(e) => beinginpuit(e)}
          placeholder="请输入合约"
        ></input>
        <button
          onClick={() => {
            addContract();
          }}
        >
          添加合约
        </button>
      </div>
      <div className="collections">
        {x.map((e, i) => {
          return (
            <div
              className="oneCollection"
              onClick={() => clickHandler(e.slug)}
              key={i}
            >
              <img src={e.img} alt={i} className="frontLogo" />
              {e.name}
              <p>{e.slug.slice(0, 6) + "......" + e.slug.slice(-4)}</p>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default Home;
