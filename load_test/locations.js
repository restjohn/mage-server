import http from 'k6/http';
import { sleep } from 'k6';

const token = __ENV.MAGE_TOKEN
console.info('MAGE_TOKEN', token)
const cookie = `TS011e0e74=01e474bd47f9ec02d95c40b8060236b417c224e7574361813bd0aa75ecdea427176e6b30a7f82139885bfdf1cae2bc1cdc05320b46; rampartjwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiM2FjYTkyYy00MGNlLTRiMTgtODc2ZC04NTg4OTk2YzY0Y2IiLCJlbWFpbEFkZHJlc3MiOiJyb2JlcnQuZS5zdGpvaG4uY3RyQG5nYS5taWwiLCJyb2xlcyI6W10sImlzcyI6IlJBTVBBUlQiLCJwZXJzb25JZCI6ImIzYWNhOTJjLTQwY2UtNGIxOC04NzZkLTg1ODg5OTZjNjRjYiIsImV4cCI6MTY5NDA2MDE1NCwiZGV2aWNlIjoiQ3hTSld2S04xamFqVE56anJBZ0FPWFdSQkpnIiwiaWF0IjoxNjk0MDMxMzU0LCJ1c2VybmFtZSI6InJvYmVydC5lLnN0am9obi5jdHIiLCJleHBNYXgiOjE2OTQwNjAxNTR9.Ts3dugEAUW7oLWDMZz6PYx6e1YEMYseYZg-4YMsSIabLKGtstI3cpzXguqIKxH3dNJGPUIer3SCQsxbMwcCGNbDuwuVvY2edlDnvkVKjFZNvaJe8ThlDKxKbHciY-G_IhV9QgHPWvUuYw1iMngkJzvqTJbSinCxWWunTObySRe5zv4ZDlctGr2Cz3v6yi42NDqWVkjUmM7adwuJlqQVix7D3IxedYBJzsoWtPdXvAXLdS4_lZaOcCF5XZQrxoaZZokCMZ1j9TCexHlpzcoF-wq3LD91tFViIh9McYVBDNpjLbDbAA6pPy0rl5PzFF8CHJNlVCIXqxCYllFVg93EGQg; mage-sso-token=eab401e9bac32df9bec090561eb88af32f450cd4; TS01bea426=01e474bd4765cb11ecd78715db6ce3e0ee0c4db3839013bccf1a6d5281eff0f86c7081f6ad60a8ef5d87d24dac81d2d93c76ab06eddd560cb98f4d6fa45a34a37baeb2bbd353e3c20ed24461538dbb9da3f92bb2ef; connect.sid=s%3AGvkNGv0POZXLTHdOj4botIAxJOjYsEKg.6YgzxjOtotxCDZ1vw4JtC8V7mtohvjMl5pLdJAsCdk8; TS01f22bf1=01e474bd47102ebdbd21bda63bb55528293e248d1eee5803b400913e8a00cd0f5dfcdc8a323dc6917ddb912c91d85326aa70e9c0edb01067021fa758835c827840d1a04f85`
// const eventId = 4
// const baseUrl = "https://www-mage.staging.pixtomorrow.net/"
const eventId = 59
const baseUrl = "https://www-mage.pixtoday.net"
const locations = [{
  "eventId": eventId,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}, {
  "eventId": 14,
  "geometry": {
    "type": "Point",
    "coordinates": [
      -104.8749058,
      39.5382941
    ]
  },
  "properties": {
    "timestamp": 1693257258886,
    "accuracy": 20
  }
}]

export default function () {
  const response = http.post(
    `${baseUrl}/api/events/${eventId}/locations`,
    JSON.stringify(locations),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Cookie: cookie,
        // Referer: 'https://www-mage.pixtoday.net/',
        'User-Agent': `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36`
      }
    }
  )
  console.log('response:', response.status, ' --\n', JSON.stringify(response.body))

  sleep(1);
}
