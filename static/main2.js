let isScanning = false; // スキャン中かどうかを示すフラグ
let jancode = false;
$(document).ready(function () {
  let quaggaConfig = {
    inputStream: {
      type: "LiveStream",
      target: document.getElementById("my_quagga"),
      constraints: {
        width: 800,
        height: 600,
        facingMode: "environment", // リアカメラを使用
      },
    },
    locator: {
      patchSize: "medium",
      halfSample: true,
    },
    numOfWorkers: 2,
    locate: true,
    multiple: false,
    locator: {
      halfSample: true,
      patchSize: "medium",
    },
  };

  // Quagga.jsを初期化する関数
  function initQuagga() {
    Quagga.init(quaggaConfig, function (err) {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Quagga.js initialized");
      Quagga.start();
    });
  }

  // スキャニングを開始する関数
  function startScanning(expectedLength, customPattern) {
    isScanning = true;
    Quagga.onDetected(function (result) {
      const code = result.codeResult.code;
      if (customPattern && customPattern.test(code)) {
        displayResult(code);
        // stopScanning();
      } else if (code.length === expectedLength && jancode) {
        displayResult(code);
        // stopScanning();
      }
    });

    Quagga.onProcessed((result) => {
      if (result == null) return;
      if (typeof result !== "object") return;
      if (result.boxes === undefined) return;
      const ctx = Quagga.canvas.ctx.overlay;
      const canvas = Quagga.canvas.dom.overlay;
      ctx.clearRect(0, 0, parseInt(canvas.width), parseInt(canvas.height));
      Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, ctx, { color: "blue", lineWidth: 5 });
    });
  }

  // スキャニングを停止する関数
  function stopScanning() {
    Quagga.stop();
    isScanning = false;
  }

  // 結果を表示する関数
  function displayResult(code) {
    $("#my_result").text("読み取り結果: " + code);
    if (jancode) {
      $("#codename").val(code)
      $("#codename").attr('name', 'jan');
    } else {
      $("#codename").val(code)
      $("#codename").attr('name', 'zf330');
    }

  }

  // JANボタンクリック時の処理
  $("#startJAN").click(function () {
    if (isScanning) {
      Quagga.stop();
      isScanning = false;
    }
    quaggaConfig.decoder = {
      readers: ["ean_reader"],
    };
    initQuagga();
    jancode = true;
    startScanning(13);
  });

  // ZF330ボタンクリック時の処理
  $("#startZF330").click(function () {
    if (isScanning) {
      Quagga.stop();
      isScanning = false;
    }
    quaggaConfig.decoder = {
      readers: ["code_128_reader"],
    };
    initQuagga();
    jancode = false;
    startScanning(13, /^ZF330-I00\d{4}$/);
  });

  // STOPボタンクリック時の処理
  $("#stopScanning").click(function () {
    if (isScanning) {
      stopScanning();
    }
  });
});