const stocks = [
  "AAPL",
  "MSFT",
  "GOOGL",
  "AMZN",
  "PYPL",
  "TSLA",
  "JPM",
  "NVDA",
  "NFLX",
  "DIS",
];

async function render() {
  document.getElementById("chart").style.display = "none";
  let stockChartsData, stockStatsData, stockSummary;

  try {
    const [chartsRes, statsRes, summaryRes] = await Promise.all([
      fetch("https://mocki.io/v1/3295edc5-d4eb-41d4-931a-4ceb232ff1da"),
      fetch("https://mocki.io/v1/a8a7e040-aa37-4451-bca3-e561868ec0e7"),
      fetch("https://mocki.io/v1/643739c6-a043-45f7-9208-239087e003be"),
    ]);

    const data1 = await chartsRes.json();
    stockChartsData = data1?.stocksData;
    const data2 = await statsRes.json();
    stockStatsData = data2?.stocksStatsData;
    const data3 = await summaryRes.json();
    stockSummary = data3?.stocksProfileData;
  } finally {
    document.getElementById("chart").style.display = "block";
  }

  initializeUI(stockChartsData, stockStatsData, stockSummary);
}

function initializeUI(stockChartsData, stockStatsData, stockSummary) {
  const stockListEle = document.getElementById("stockList");
  const defaultStock = stocks[0];
  const defaultTime = "5y";

  let chart = initializeChart(
    stockChartsData,
    stockStatsData,
    stockSummary,
    defaultStock,
    defaultTime
  );

  stocks.forEach((stock) => {
    const stockDetailsDivEle = createStockElement(stock, stockStatsData);
    stockDetailsDivEle.querySelector("button").onclick = () => {
      const data = createChartData(
        stockChartsData,
        stockStatsData,
        stockSummary,
        stock,
        defaultTime
      );
      updateChart(chart, stock, data);
    };
    stockListEle.appendChild(stockDetailsDivEle);
  });

  ["1mo", "3mo", "1y", "5y"].forEach((period) => {
    document.getElementById(`${period}_button`).onclick = () => {
      const currentStock = document.getElementById("stockName").textContent;
      const data = createChartData(
        stockChartsData,
        stockStatsData,
        stockSummary,
        currentStock,
        period
      );
      updateChart(chart, currentStock, data);
    };
  });
}

function initializeChart(
  stockChartsData,
  stockStatsData,
  stockSummary,
  stock,
  time
) {
  const data = createChartData(
    stockChartsData,
    stockStatsData,
    stockSummary,
    stock,
    time
  );
  const options = {
    series: [{ name: stock, data }],
    chart: {
      id: "area-datetime",
      type: "area",
      height: 350,
      zoom: { autoScaleYaxis: true },
    },
    dataLabels: { enabled: false },
    markers: { size: 2, style: "hollow" },
    xaxis: {
      type: "datetime",
      min: data[0][0],
      tickAmount: 10,
    },
    tooltip: {
      x: { format: "dd MMM yyyy" },
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
  };
  const chart = new ApexCharts(
    document.querySelector("#chart-timeline"),
    options
  );
  chart.render();
  return chart;
}

function createStockElement(stock, stockStatsData) {
  const stockDetailsDivEle = document.createElement("div");
  stockDetailsDivEle.classList.add("stockDetailsDiv");

  const stockBtnEle = document.createElement("button");
  const stockPriceEle = document.createElement("span");
  const stockProfitEle = document.createElement("span");

  stockBtnEle.textContent = stock;
  stockPriceEle.textContent = `$${stockStatsData[0][stock].bookValue.toFixed(
    2
  )}`;
  stockProfitEle.textContent = `${stockStatsData[0][stock].profit.toFixed(2)}%`;
  stockProfitEle.style.color =
    stockStatsData[0][stock].profit > 0 ? "green" : "red";

  stockDetailsDivEle.append(stockBtnEle, stockPriceEle, stockProfitEle);
  return stockDetailsDivEle;
}

function createChartData(
  stockChartsData,
  stockStatsData,
  stockSummary,
  stock,
  time
) {
  const timeArr = stockChartsData[0][stock][time].timeStamp;
  const valArr = stockChartsData[0][stock][time].value;
  const dataArr = timeArr.map((time, i) => [time * 1000, valArr[i].toFixed(2)]);

  updateStockDetails(stockStatsData, stockSummary, stock, valArr);
  return dataArr;
}

function updateStockDetails(stockStatsData, stockSummary, stock, values) {
  const minVal = Math.min(...values).toFixed(2);
  const maxVal = Math.max(...values).toFixed(2);

  document.getElementById("stockName").textContent = stock;
  document.getElementById(
    "book_Value"
  ).textContent = `$${stockStatsData[0][stock].bookValue}`;
  document.getElementById(
    "profit"
  ).textContent = `${stockStatsData[0][stock].profit}%`;
  document.getElementById("profit").style.color =
    stockStatsData[0][stock].profit > 0 ? "green" : "red";
  document.getElementById("stockSummary").textContent =
    stockSummary[0][stock].summary;
  document.getElementById("stockMin").textContent = `Low value: $${minVal}`;
  document.getElementById("stockMax").textContent = `Peak value: $${maxVal}`;
}

function updateChart(chart, stock, data) {
  chart.updateOptions({
    series: [{ name: stock, data }],
    xaxis: { min: data[0][0] },
  });
}

render();
