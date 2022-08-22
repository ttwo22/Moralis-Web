import React from "react";
import { Table } from "antd";
import { useState, useEffect } from "react";
import { Icon, Badge, Logo } from "web3uikit";
import etherscan from "../images/etherscan.png";
import opensea from "../images/opensea.png";
import { useNavigate, useParams } from "react-router-dom";
// import { allCollections } from "../collectionsFile";

import Spinner from "react-bootstrap/Spinner";
import "bootstrap/dist/css/bootstrap.min.css";

//moralis
const Moralis = require("moralis-v1/node");

export default function Collection() {
  const [data, setData] = useState([]);
  const [collectionData, setCollectionData] = useState();
  const [ownersData, setOwnersData] = useState();
  const [historyData, setHistoryData] = useState();
  const [beubng, setBeubng] = useState(false);

  const [largest, setLargest] = useState("NA");
  const [highBuy, setHighBuy] = useState("NA");
  const [longHold, setLongHold] = useState("NA");

  const { collection } = useParams();
  const navigate = useNavigate();

  const clickHandler = (addrs) => {
    navigate(`/${collection}/${addrs}`);
  };

  const BasicExample = () => {
    return (
      <Spinner animation="border" role="status" variant="light">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  };

  Array.prototype.getUnique = function () {
    var uniques = [];
    for (var i = 0, l = this.length; i < l; i++) {
      if (this.lastIndexOf(this[i]) == this.indexOf(this[i])) {
        uniques.push(this[i]);
      }
    }
    return uniques;
  };

  const averageDaySinceBuy = (array) => {
    let ms;
    if (array.length > 1) {
      ms =
        array.reduce((a, b) => new Date(a).getTime() + new Date(b).getTime()) /
        array.length;
    } else {
      ms = new Date(array[0]).getTime();
    }
    const diff = Math.floor((new Date().getTime() - ms) / 86400000);
    return diff;
  };

  const averagePrice = (array) => {
    const filteredZero = array.filter((item) => item !== 0);
    const filtered = filteredZero.getUnique();
    if (filtered.length > 1) {
      return (
        filtered.reduce((a, b) => Number(a) + Number(b)) /
        filtered.length /
        1e18
      );
    } else if (filtered.length === 1) {
      return filtered[0] / 1e18;
    } else {
      return 0;
    }
  };

  // 获取所有所有者
  // const getAllOwners = async () => {
  //   const response = await Moralis.Web3API.token.getContractNFTTransfers({
  //     address: collection,
  //     chain: "eth",
  //     limit: 100,
  //   });
  //   let res = response;
  //   console.log('res',res);
  //   console.log(
  //     `Got page ${response.page} of ${Math.ceil(
  //       response.total / response.page_size
  //     )}, ${response.total} total`
  //   );

  //   if (res) {
  //     let date = new Date();
  //     date.setDate(date.getDate() - 30);
  //     const blockoptions = {
  //       chain: "Eth",
  //       date: date,
  //     };
  //     const block = await Moralis.Web3API.native.getDateToBlock(blockoptions);
  //     const monthBlock = Number(block.block);
  //     let accountedTokens = [];
  //     let owners = {};
  //     for (const transfer of res.result) {
  //       let recentTx = 0;
  //       if (monthBlock < Number(transfer.block_number)) {
  //         recentTx = 1;
  //       }
  //       if (!accountedTokens.includes(transfer.token_id)) {
  //         owners[transfer.to_address] = {
  //           address: transfer.to_address,
  //           amount: Number(transfer.amount),
  //           tokenId: [transfer.token_id],
  //           prices: [Number(transfer.value)],
  //           dates: [transfer.block_timestamp],
  //           recentTx: recentTx,
  //           avgHold: averageDaySinceBuy([transfer.block_timestamp]),
  //           avgPrice: Number(transfer.value) / 1e18,
  //         };
  //         accountedTokens.push(transfer.token_id);
  //       } else if (!accountedTokens.includes(transfer.token_id)) {
  //         owners[transfer.to_address].amount++;
  //         owners[transfer.to_address].tokenId.push(transfer.token_id);
  //         owners[transfer.to_address].prices.push(Number(transfer.value));
  //         owners[transfer.to_address].dates.push(transfer.block_timestamp);
  //         owners[transfer.to_address].recentTx =
  //           owners[transfer.to_address].recentTx + recentTx;
  //         owners[transfer.to_address].avgHold = averageDaySinceBuy(
  //           owners[transfer.to_address].dates
  //         );
  //         owners[transfer.to_address].avgPrice = averagePrice(
  //           owners[transfer.to_address].prices
  //         );
  //         accountedTokens.push(transfer.token_id);
  //       }
  //       if (owners[transfer.from_address] && recentTx === 1) {
  //         owners[transfer.from_address].recentTx =
  //           owners[transfer.from_address].recentTx - recentTx;
  //       } else if (!owners[transfer.from_address] && recentTx === 1) {
  //         owners[transfer.from_address] = {
  //           address: transfer.from_address,
  //           amount: 0,
  //           tokenId: [],
  //           prices: [],
  //           dates: [],
  //           recentTx: -recentTx,
  //           avgHold: 0,
  //           avgPrice: 0,
  //         };
  //       }
  //     }
  //     setOwnersData(owners);
  //   }
  // };

  async function getAllOwners() {
    let owners = {};
    let history = {};
    let res;
    let accountedTokens = [];
    let date = new Date();
    date.setDate(date.getDate() - 30);

    const blockoptions = {
      chain: "Eth",
      date: date,
    };

    const block = await Moralis.Web3API.native.getDateToBlock(blockoptions);

    const monthBlock = Number(block.block);
    const response = await Moralis.Web3API.token.getContractNFTTransfers({
      address: collection,
      chain: "eth",
      limit: 100,
    });

    res = response;

    for (const transfer of res.result) {
      let recentTx = 0;
      if (monthBlock < Number(transfer.block_number)) {
        recentTx = 1;
      }

      if (
        !owners[transfer.to_address] &&
        !accountedTokens.includes(transfer.token_id)
      ) {
        owners[transfer.to_address] = {
          address: transfer.to_address,
          amount: Number(transfer.amount),
          tokenId: [transfer.token_id],
          prices: [Number(transfer.value)],
          dates: [transfer.block_timestamp],
          recentTx: recentTx,
          avgHold: averageDaySinceBuy([transfer.block_timestamp]),
          avgPrice: Number(transfer.value) / 1e18,
        };

        accountedTokens.push(transfer.token_id);
      } else if (!accountedTokens.includes(transfer.token_id)) {
        owners[transfer.to_address].amount++;
        owners[transfer.to_address].tokenId.push(transfer.token_id);
        owners[transfer.to_address].prices.push(Number(transfer.value));
        owners[transfer.to_address].dates.push(transfer.block_timestamp);
        owners[transfer.to_address].recentTx =
          owners[transfer.to_address].recentTx + recentTx;
        owners[transfer.to_address].avgHold = averageDaySinceBuy(
          owners[transfer.to_address].dates
        );
        owners[transfer.to_address].avgPrice = averagePrice(
          owners[transfer.to_address].prices
        );

        accountedTokens.push(transfer.token_id);
      }

      if (owners[transfer.from_address] && recentTx === 1) {
        owners[transfer.from_address].recentTx =
          owners[transfer.from_address].recentTx - recentTx;
      } else if (!owners[transfer.from_address] && recentTx === 1) {
        owners[transfer.from_address] = {
          address: transfer.from_address,
          amount: 0,
          tokenId: [],
          prices: [],
          dates: [],
          recentTx: -recentTx,
          avgHold: 0,
          avgPrice: 0,
        };
      }

      if (!history[transfer.to_address]) {
        history[transfer.to_address] = [
          {
            to: transfer.to_address,
            from: transfer.from_address,
            price: transfer.value,
            date: transfer.block_timestamp,
            tokenId: transfer.token_id,
          },
        ];
      } else {
        history[transfer.to_address].push({
          to: transfer.to_address,
          from: transfer.from_address,
          price: transfer.value,
          date: transfer.block_timestamp,
          tokenId: transfer.token_id,
        });
      }

      if (!history[transfer.from_address]) {
        history[transfer.from_address] = [
          {
            to: transfer.to_address,
            from: transfer.from_address,
            price: transfer.value,
            date: transfer.block_timestamp,
            tokenId: transfer.token_id,
          },
        ];
      } else {
        history[transfer.from_address].push({
          to: transfer.to_address,
          from: transfer.from_address,
          price: transfer.value,
          date: transfer.block_timestamp,
          tokenId: transfer.token_id,
        });
      }

      setOwnersData(owners);
      // console.log(owners);

      // setHistoryData(history);
      // console.log(history);
    }
  }

  

  useEffect(() => {
    const appId = "cQHgw1MAZLXSlJjAFdtSeaeXjTCHC5y6xyRnf8jL";
    const serverUrl = "https://uxh1al9mariw.usemoralis.com:2053/server";
    Moralis.start({ serverUrl: serverUrl, appId: appId });

    let test = sessionStorage.getItem('collectionItem');
    console.log(JSON.parse(test));
    const being = JSON.parse(test)
    
    const result = being.filter((obj) => {
      return obj.slug === collection;
    });
    console.log(result);
    setCollectionData(result[0]);

    getAllOwners();

    setTimeout(() => {
      const Byei = [];
      console.log(ownersData);
      const x = [Object.values(ownersData)];
      const bags = x[0].map((a) => a.amount);
      const holds = x[0].map((a) => a.avgHold);
      const prices = x[0].map((a) => a.avgPrice);
      const highestAmount = Math.max(...bags);
      const longestHold = Math.max(...holds);
      const highestBuy = Math.max(...prices);
      setLargest(highestAmount);
      setHighBuy(highestBuy.toFixed(2));
      setLongHold(Math.floor(longestHold));
      for (let i of x) {
        Byei.push(i);
      }
      if(Byei!==[]){
        setBeubng(true)
      }else{
        setBeubng(false)
      }
      setData(Byei);
    }, 1000);
  }, [ownersData]);

  const columns = [
    {
      title: "地址",
      dataIndex: "address",
      render: (addr) => (
        <a onClick={() => clickHandler(addr)}>{`${addr.slice(
          0,
          6
        )}...${addr.slice(36)}`}</a>
      ),
    },
    {
      title: "当前数量",
      dataIndex: "amount",
      defaultSortOrder: "descend",
      sorter: {
        compare: (a, b) => a.amount - b.amount,
      },
    },

    {
      title: "平均举行天数",
      dataIndex: "avgHold",
      sorter: {
        compare: (a, b) => a.avgHold - b.avgHold,
      },
    },
    {
      title: (
        <div className="App">
          平均价格
          <Icon fill="#ffffff" svg="eth" />
        </div>
      ),
      dataIndex: "avgPrice",
      sorter: {
        compare: (a, b) => a.avgPrice - b.avgPrice,
      },
      render: (price) => price.toFixed(2),
    },
    {
      title: (
        <div className="App">
          数量变化 <Badge text="30D" textVariant="caption12" />
        </div>
      ),
      dataIndex: "recentTx",
      sorter: {
        compare: (a, b) => a.recentTx - b.recentTx,
      },
      render: (num) => {
        if (num > 0) {
          return <div style={{ color: "green" }}>+{num}</div>;
        } else if (num < 0) {
          return <div style={{ color: "red" }}>{num}</div>;
        } else {
          return <div>0</div>;
        }
      },
    },
  ];

  return (
    <>
      {collectionData && (
        <div className="title">
          <img src={collectionData.img} alt="colLogo" className="logoImg" />
          {collectionData.name}
        </div>
      )}
      <div className="stats">
        <div className="colStats">
          <div>
            <div className="stat">{longHold}</div>
            最长平均持有时间
          </div>
          <div>
            <div className="stat">{largest}</div>
            最大的包
          </div>

          <div>
            <div className="stat">
              <Icon fill="#ffffff" svg="eth" />
              {highBuy}
            </div>
            最高平均买入
          </div>
        </div>
        <div className="colLinks">
          <img src={opensea} alt="os" className="link" />
          <img src={etherscan} alt="es" className="link" />
        </div>
      </div>
      <div className="App">
        <div className="tableContainer">
          {beubng ? (
            <Table
              columns={columns}
              dataSource={data[0]}
              rowKey={(record) => record.address}
            />
          ) : (
            BasicExample()
          )}
        </div>
      </div>
    </>
  );
}
