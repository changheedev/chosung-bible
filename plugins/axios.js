export default function({ $axios }) {
  $axios.defaults.timeout = 3000;

  $axios.onResponse(response => {
    return response.data;
  });
}
