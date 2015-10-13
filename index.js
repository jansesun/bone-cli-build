var fs = require('fs'),
	path = require('path'),
	pkg = require('./package.json'),
	timeMap = ['','a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
function timestamp() {
	// 组合时间戳
	var time = new Date(),
		year, month, date;
	year = time.getFullYear() - 2000;
	month = (time.getMonth() + 1) + '';
	month = month.length > 1 ? month : ('0' + month);
	date = time.getDate() + '';
	date = date.length > 1 ? date : ('0' + date);
	return year + month + date;
}
function getTargetFile(file, bone, dir) {
	var autoNameNum = 0,
		ext = path.extname(file),
		basename = path.basename(file, ext),
		nameFlag;
	do {
		nameFlag = timeMap[Math.floor(autoNameNum / 26)];
		nameFlag += timeMap[Math.floor(autoNameNum % 26)];
		autoNameNum++;
		file = dir + basename + '_' + timestamp() + nameFlag + ext;
	} while(bone.fs.existFile(file));
	return file;
}
function buildFileArray(files, bone) {
	files.forEach(function(file) {
		var targetFile,
			dir = '.' + path.dirname(file).replace(/^(\.\/)?build/, '') + '/';
		file = path.resolve(file);
		targetFile = getTargetFile(file, bone, dir);
		if(bone.fs.existFile(file, {notFs: true})) {
			var readStream = bone.fs.createReadStream(file);
			var writeStream = bone.fs.createWriteStream(targetFile , {focus: true});

			readStream.pipe(writeStream, {end: false});
			readStream.on('end', function() {
				console.log('[build] ' + targetFile);
			});
		} else {
			console.log('[warn] not exist '+ file);
		}
	});
}

function setup() {
	return function(command, bone) {
		var builder = command('build');
		builder.description('build file/project')
			.version(pkg.version)
			.option('-p, --project <project>', 'build project', function(project) {
				var files = bone.project(project);
				if(files) {
					buildFileArray(files, bone);
				} else {
					console.log('[warn] not exist project '+project);
				}
			})
			.option('-l, --list <project>', 'list project contents', function(project) {
				var files = bone.project(project);
				if(files) {
					files.forEach(function(file) {
						console.log('[file] '+file.replace(bone.fs.base, '~'));
					});
				} else {
					console.log('[warn] not exist project '+project);
				}
			})
			.action(function() {
				var files = Array.prototype.slice.call(arguments).slice(0, -1);

				if(files.length) {
					buildFileArray(files, bone);
				}
			});
	};
}

module.exports = setup;