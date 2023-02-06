const XBOX360Retitler = {

  getDataArray: function () {
    return this.dataArray;
  },

  setDataArray: function (array) {
    this.dataArray = array.slice();
  },

  getCurrentTitle: function () {
    return this.currentTitle;
  },

  setCurrentTitle: function (title) {
    this.currentTitle = title;
  },

  getFileName: function () {
    return this.fileName;
  },

  setFileName: function (name) {
    this.fileName = name;
  },

  readTitle: function (array) {
    let firstTitle = "",
      secondTitle = "";
    for (let i = 0x412; array[i] != 0x00; i += 2) {
      firstTitle += String.fromCharCode(array[i]);
      secondTitle += String.fromCharCode(array[i + 0x1280]);
    }
    if (firstTitle !== secondTitle) {
      alert("Corrupted file.");
    }
    return firstTitle;
  },

  changeTitle: function (array, title) {
    let i = 0x412;
    for (let j = 0; j < title.length; j++) {
      array[i] = title.charCodeAt(j);
      array[i + 0x1280] = title.charCodeAt(j);
      i += 2;
    }
    for (; array[i] != 0x00; i += 2) {
      array[i] = 0x00;
      array[i + 0x1280] = 0x00;
    }
  },

  writeHash: function (array) {
    let sha1 = SHA1Generator.calcSHA1FromByte(array.slice(0x344));
    for (let i = 0; i < 20; i++) {
      array[0x32c + i] = parseInt(sha1.substring(i * 2, i * 2 + 2), 16);
    }
  },

  handleFile: function (input) {
    let file = input.files[0];
    let reader = new FileReader();
    reader.onload = () => {
      let buffer = new Uint8Array(reader.result);
      let array = Array.from(buffer);
      document.getElementById("old-title").value = this.readTitle(array);
      document.getElementById("new-title").disabled = false;
      this.setDataArray(array);
      this.setFileName(file.name);
    };
    reader.readAsArrayBuffer(file);
  },

  handleNewTitle: function (title) {
    if (title !== "") {
      document.getElementById("convert").disabled = false;
      this.setCurrentTitle(title);
    }
    else {
      document.getElementById("convert").disabled = true;
    }
  },

  handleConvert: function () {
    this.changeTitle(this.getDataArray(), this.getCurrentTitle());
    this.writeHash(this.getDataArray());
    let blob = new Blob([new Uint8Array(this.getDataArray())], {
      type: "application/octet-stream",
    });
    let link = document.getElementById("download");
    link.href = window.URL.createObjectURL(blob);
    link.download = this.getFileName();
  }

};
