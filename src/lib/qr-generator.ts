export type QRDataType =
  | "text"
  | "url"
  | "phone"
  | "email"
  | "sms"
  | "wifi"
  | "vcard"
  | "event"
  | "location"
  | "upi"
  | "social"
  | "appstore";

export function generateQRData(
  type: QRDataType,
  data: Record<string, string>
): string {
  switch (type) {
    case "text":
      return data.text || "";

    case "url":
      return data.url || "";

    case "phone":
      return `tel:${data.phone || ""}`;

    case "email": {
      const email = data.email || "";
      const subject = data.subject ? `?subject=${encodeURIComponent(data.subject)}` : "";
      const body = data.body
        ? `${subject ? "&" : "?"}body=${encodeURIComponent(data.body)}`
        : "";
      return `mailto:${email}${subject}${body}`;
    }

    case "sms": {
      const phone = data.phone || "";
      const message = data.message
        ? `?body=${encodeURIComponent(data.message)}`
        : "";
      return `sms:${phone}${message}`;
    }

    case "wifi": {
      const ssid = data.ssid || "";
      const password = data.password || "";
      const encryption = data.encryption || "WPA";
      const hidden = data.hidden === "true" ? "H:true;" : "";
      
      if (encryption === "nopass") {
        return `WIFI:S:${ssid};T:nopass;${hidden};`;
      }
      return `WIFI:S:${ssid};T:${encryption};P:${password};${hidden};`;
    }

    case "vcard": {
      const firstName = data.firstName || "";
      const lastName = data.lastName || "";
      const organization = data.organization || "";
      const phone = data.phone || "";
      const email = data.email || "";
      const website = data.website || "";

      return `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${firstName} ${lastName}
${organization ? `ORG:${organization}` : ""}
${phone ? `TEL:${phone}` : ""}
${email ? `EMAIL:${email}` : ""}
${website ? `URL:${website}` : ""}
END:VCARD`;
    }

    case "event": {
      const title = data.title || "";
      const startDate = data.startDate
        ? new Date(data.startDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        : "";
      const endDate = data.endDate
        ? new Date(data.endDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        : "";
      const location = data.location || "";
      const description = data.description || "";

      return `BEGIN:VEVENT
SUMMARY:${title}
${startDate ? `DTSTART:${startDate}` : ""}
${endDate ? `DTEND:${endDate}` : ""}
${location ? `LOCATION:${location}` : ""}
${description ? `DESCRIPTION:${description}` : ""}
END:VEVENT`;
    }

    case "location": {
      const latitude = data.latitude || "";
      const longitude = data.longitude || "";
      return `geo:${latitude},${longitude}`;
    }

    case "upi": {
      const upiId = data.upiId || "";
      const name = data.name || "";
      const amount = data.amount || "";
      const note = data.note || "";

      let upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}`;
      if (amount) upiUrl += `&am=${amount}`;
      if (note) upiUrl += `&tn=${encodeURIComponent(note)}`;

      return upiUrl;
    }

    case "social": {
      const platform = data.platform || "instagram";
      const username = data.username || "";

      const platformUrls: Record<string, string> = {
        instagram: `https://instagram.com/${username}`,
        twitter: `https://twitter.com/${username}`,
        linkedin: username.startsWith("http") 
          ? username 
          : `https://linkedin.com/in/${username}`,
        facebook: `https://facebook.com/${username}`,
        youtube: username.startsWith("http")
          ? username
          : `https://youtube.com/@${username}`,
        tiktok: `https://tiktok.com/@${username}`,
        github: `https://github.com/${username}`,
      };

      return platformUrls[platform] || username;
    }

    case "appstore": {
      const store = data.store || "ios";
      const appId = data.appId || "";

      if (store === "ios") {
        return `https://apps.apple.com/app/${appId}`;
      } else {
        return `https://play.google.com/store/apps/details?id=${appId}`;
      }
    }

    default:
      return "";
  }
}
