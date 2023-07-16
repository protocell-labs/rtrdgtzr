////// UTILS //////


// FXHASH random function for specific implimentation
//gene = fxrand;
const gene = fxrandminter;

// rand functions for random generator
// assumes generator producing float point between 0 and 1

// return random integer number between min and max
function gene_rand_int(min, max) {
  return Math.floor((gene() * (max - min)) + min);
}

// return random number between min and max
function gene_range(min, max) {
  return (gene() * (max - min)) + min;
}

// return n random numbers in a list
function gene_pick_n(min, max, n) {
  var unique_list = [];
  for (var i = 0; i < n; i++) {
    unique_list.push(Math.floor((gene() * (max-min)) + min));
  }
  return unique_list
}

// return random element from a list with set weights in form:
// data = [ ["a", 50], ["b", 25], ["c", 25] ]; numbers are not strict probabilities so don't have to add up to 100
function gene_weighted_choice(data) {
  let total = 0;
  for (let i = 0; i < data.length; ++i) {
      total += data[i][1];
  }
  const threshold = gene() * total;
  total = 0;
  for (let i = 0; i < data.length - 1; ++i) {
      total += data[i][1];
      if (total >= threshold) {
          return data[i][0];
      }
  }
  return data[data.length - 1][0];
}

// choose a random property name (key) from an object
function gene_pick_key(obj) {
	var keys = Object.keys(obj);
	return keys[keys.length * gene() << 0];
  }
  
  // choose a random property from an object
  function gene_pick_property(obj) {
	var keys = Object.keys(obj);
	return obj[keys[keys.length * gene() << 0]];
  }