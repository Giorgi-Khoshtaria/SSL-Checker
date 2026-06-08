import tls from "tls";
import { URL } from "url";

export const getSSLCert = async (website) => {
  const url = new URL(website);

  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      url.port || 443,
      url.hostname,
      {
        servername: url.hostname,
        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        resolve(cert);
      },
    );

    socket.on("error", reject);
  });
};
