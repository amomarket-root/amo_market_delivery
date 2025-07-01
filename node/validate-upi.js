import verifyUPI from 'validate-upi-id';

const upi = process.argv[2];

verifyUPI(upi)
  .then((res) => {
    if (res && res.vpaValid) {
      res.payeeAccountName = res.payeeAccountName || null;
    }
    console.log(JSON.stringify(res));
  })
  .catch((err) => {
    console.error(JSON.stringify({ vpaValid: false, message: err.message }));
    process.exit(1);
  });
