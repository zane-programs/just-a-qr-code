(function (window, document) {
  async function handleQrForm(e) {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }

    // Valid form, so generate QR
    const formValues = Object.fromEntries(new FormData(e.target));

    const qrObjectUrl = await generateQrCode(formValues);
    const timestamp = Date.now();

    document.querySelector("#qr-preview img").src = qrObjectUrl;
    document.querySelector("#qr-preview img").style.maxWidth =
      formValues.width + "px";
    document.querySelector("#qr-preview button").onclick = function () {
      downloadObjectUrl(qrObjectUrl, timestamp);
    };

    document.getElementById("qr-form").style.display = "none";
    document.getElementById("qr-preview").style.display = null;
  }

  async function shortenUrl(url) {
    const req = await fetch(
      "https://tinyurl.com/api-create.php?url=" + encodeURIComponent(url)
    );
    const res = await req.text();

    if (res === "Error") {
      throw new Error("TinyURL Error");
    }

    return res;
  }

  async function downloadObjectUrl(objectUrl, timestamp) {
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = objectUrl;
    a.download = `justaqrcode_${timestamp ?? Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
  }

  async function generateQrCode(formValues) {
    const url = encodeURIComponent(
      formValues.shorten ? await shortenUrl(formValues.url) : formValues.url
    );

    const { width, height, margin, errorCorrection } = formValues;

    const qrImageUrl = `https://chart.googleapis.com/chart?chs=${width}x${height}&cht=qr&chl=${url}&choe=UTF-8&chld=${errorCorrection}|${margin}`;

    const qrReq = await fetch(qrImageUrl);
    const qrRes = await qrReq.blob();
    const qrObjectUrl = URL.createObjectURL(qrRes);

    return qrObjectUrl;
  }

  function handleSubgridButton() {
    const isVisible = JSON.parse(
      this.parentElement.getAttribute("data-visible")
    );
    this.parentElement.setAttribute("data-visible", JSON.stringify(!isVisible));
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("qr-form").addEventListener("submit", handleQrForm);
    document.querySelectorAll(".subgrid .subgrid-button").forEach((item) => {
      item.addEventListener("click", handleSubgridButton);
    });
  });
})(window, document);
