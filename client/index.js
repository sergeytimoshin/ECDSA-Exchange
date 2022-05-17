import "./index.scss";

const server = "http://localhost:3042";

document
  .getElementById("exchange-address")
  .addEventListener("input", ({ target: { value } }) => {
    if (value === "") {
      document.getElementById("balance").innerHTML = 0;
      return;
    }

    fetch(`${server}/balance/${value}`)
      .then((response) => {
        return response.json();
      })
      .then(({ balance }) => {
        document.getElementById("balance").innerHTML = balance;
      })
      .catch(err => console.log(err));
    
  });

document.getElementById("transfer-amount").addEventListener("click", () => {
  const sender = document.getElementById("exchange-address").value;
  const amount = Number(parseFloat(document.getElementById("send-amount").value));  
  const recipient = document.getElementById("recipient").value;
  const signature = document.getElementById("signature").value;

  const body = JSON.stringify({
    sender,
    amount,
    recipient,
    signature
  });

  const request = new Request(`${server}/send`, { method: "POST", body });

  fetch(request, { headers: { "Content-Type": "application/json" } })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      else {
        throw new Error("500 error");
      }
    })
    .then(({ balance }) => {
      document.getElementById("balance").innerHTML = balance;
    })
    .catch(err => console.log(err));
});
