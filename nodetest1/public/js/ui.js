google.load('visualization', '1.1', {packages: ['corechart', 'bar']});
      
      var tagList=[];
      var dati;

      $(document).ready(function() {
        setHeightWindows();
        $.getJSON(webserver+'/tags', function(data){
          $.each(data, function(index,value){
            $("<div class=\"btn btn-default\" id=\""+ value +"\" style=\"margin-bottom:12px;margin-left:12px;\" onclick=\"selectionTag(id)\">" + value +"</div>").appendTo('#listingTag_Body');
          })
        })
      });
      
      function setHeightWindows(){
        var hWindow = calcHeightWindow(window);        
        var hNavBar = calcHeightWindow('#navBar');
        var hSectionTab = calcHeightWindow('#sectionTab');
        var hListingTag_header= calcHeightWindow('#listingTag_header');
        var hSelectedTag_header= calcHeightWindow('#SelectedTag_header');
        var hSectionResult_header = calcHeightWindow('#sectionResult_header');
        var hSelectedColumns_header = calcHeightWindow('#SelectedColumns_header');
        var hSelectColumnsForChart = 180;

        var hListingTag_Body = hWindow-hNavBar-hSectionTab-hListingTag_header-75;
        var hSelectedTag_Body = hWindow-hNavBar-hSectionTab-hSelectedTag_header-75;
        var hSelectedColumns_Body = hWindow-hNavBar-hSectionTab-hSelectColumnsForChart-hSelectedColumns_header-113;

        $('#listingTag_Body').css("max-height", hListingTag_Body);
        $('#SelectedTag_Body').css("max-height",hSelectedTag_Body);
        $('#SelectedColumns_Body').css("max-height",hSelectedColumns_Body);
      }

      function calcHeightWindow(id){
        return $(id).height();
      }

      function selectionTag(id){
        var indexOfTagName = tagList.indexOf(id);

        if (indexOfTagName == -1){
          document.getElementById(id).style.background="#ADFF2F";
          tagList.push(id);
          $('#SelectedTag_Body_TableBody').append("<tr id=\"line_"+ id +"\"><td>" + id + "</td><td><div class=\"btn btn-xs btn-danger\" id=\"deleteBtn/" + id +"\" onclick=\"deleteTag(id)\">X</div></td></tr>");
        }
        else{
          $('#line_'+ id).remove();
          $('#'+id).css("background-color", "");
          tagList.splice(indexOfTagName,indexOfTagName+1);
        }
      }

      function deleteTag(idBtn){
        var tagName = idBtn.split("/")[1];
        var indexOfTagName = tagList.indexOf(tagName);

        $('#line_'+tagName).remove();
        $('#'+tagName).css("background-color", "");
        tagList.splice(indexOfTagName,indexOfTagName+1);
      }

      function sendList(){
        var searchCampString = "";
        var listOfTagString = "";
        var stringToServer = "";

        resetVariableAndDiv();
        $('#globalSearchCampWarning').remove();
        
        var inputValue = $('#globalSearchForm').val();
        var inputValueSplit = inputValue.split(" ");

        searchCampString = setStringOfKeys(inputValueSplit);
        listOfTagString = setStringOfKeys(tagList);
        //console.log(searchCampString);
        //console.log(listOfTagString);

        if(searchCampString == ""){
          $("<p id=\"globalSearchCampWarning\"class=\"text-danger small\">*missing string</p>").appendTo('#globalSearch');
        }
        else if (listOfTagString == ""){
          stringToServer = "/keys/" + searchCampString;
        }
        else{
          searchCampString = "/keys/" + searchCampString;
          listOfTagString = "/tags/" + listOfTagString;
          stringToServer = listOfTagString + searchCampString;
        }
        //console.log(stringToServer);
        $.getJSON(webserver+stringToServer, function(data){
            showTableChart(data);
          });
       } 

      function resetVariableAndDiv(){
        $('#emptyResultWarning').remove();
        $('#sectionResult_body_Tab').empty();
        $('#sectionResult_body_Content').empty();
        $('#SelectedColumns_Body').empty();
      }

      function setStringOfKeys(inputValueSplit){
        var stringOfKeys="";

        $.each(inputValueSplit, function(index,value){
          if (value != ""){
            stringOfKeys += value + '%20';
          }
        });

        stringOfKeys = deleteLastThreeCharacters(stringOfKeys);
        return stringOfKeys;
      }

      function deleteLastThreeCharacters(string){
        return string.substring(0, string.length-3);
      }

      function showTableChart(tables){
        dati=tables;
        createResults(tables);
      }

      function createResults(tables){
        var keys = Object.keys(tables);
        if(keys.length == 0){
          //console.log(keys.length);
          $("<p id=\"emptyResultWarning\"class=\"text-danger\">*No result! Please, retry with other params.</p>").appendTo('#sectionResult_body');
          return;
        }
        // console.log(keys);
        // console.log(tables)
        for (var i = 0; i < keys.length; i++) {
          var tableName = keys[i];
          // console.log(tableName);
          var dataTable = tableToDataTable(tables[tableName]);
          // console.log(dataTable);
          createResultTab(i, i);
          createResultTable(dataTable, i);
          createResultChart(dataTable, i);
          createColumnsSides(dataTable,i);
          //drawGoogleChart(dataTable,i);
        }
        $('.myIndexColumn').hide();
        $('.myChart').hide();
        $('#indexColumn_0').show();
        $('#sectionResult_body_Content_li_0').addClass('active');  
        $('#sectionResult_body_Content_0').addClass('active');
        $('#sectionResult_header_switchSection_table').addClass('active');       
        $('a[href="#Result"]').tab('show');
        // google.setOnLoadCallback(drawCharts()); 
      }

      function tableToDataTable(dataTable){
        return {data:tableToDataTableBody(dataTable), columns:tableToDataTableHeader(dataTable)};
      }

      function tableToDataTableBody(dataTable){
        return dataTable.data;
      }

      function tableToDataTableHeader(dataTable){
        // console.log(dataTable);
        return dataTable.header.map(function(columnName){
          // console.log(columnName);
          return {title:columnName};
        })
      }

      function createResultTab(id, show_id ){
        var hWindow = calcHeightWindow(window);        
        var hNavBar= calcHeightWindow('#navBar');
        var hSectionTab= calcHeightWindow('#sectionTab');
        var hSectionResult_header = calcHeightWindow('#sectionResult_header');

        var hSectionResult_body = hWindow-hNavBar-hSectionTab-hSectionResult_header-158;

        $("<li class=\"text-center\" id=\"sectionResult_body_Content_li_"+id+"\"><a href=\"#sectionResult_body_Content_"+id+"\" data-toggle=\"tab\" id=\"sectionResult_body_Content"+id+"\" onclick=\"switchContent(id)\">"+show_id+"</a></li>").appendTo('#sectionResult_body_Tab');
        $("<div class=\"tab-pane fade in\" style=\"overflow:auto; max-height:"+(hSectionResult_body)+"px\" id=\"sectionResult_body_Content_"+id+"\"></div>").appendTo('#sectionResult_body_Content');        
      }

      function createResultTable(table, id){
        $("<div id=\"table_"+id+"\" class=\"myTable\" style=\"overfloaw:auto ; height:100%\"></div>").appendTo('#sectionResult_body_Content_'+id);
        $("<table border=\"3\" class=\"table table-striped table-condensed\" id=\"example"+ id +"\"></table>").appendTo('#table_'+id);
        $('#example'+id).dataTable(table);
      }

      function createResultChart(table, id){
        $("<div id=\"chart_"+id+"\" class=\"myChart\" style=\"height:100% ; width:100%\"></div>").appendTo('#sectionResult_body_Content_'+id);
      }

      function createColumnsSides(table, id){

          $("<div id=\"indexColumn_"+id+"\" class=\"myIndexColumn\" style=\"margin-left:8px;\"></div>").appendTo('#SelectedColumns_Body');
          for(index=0;index<table.columns.length; index++){
            $("<label class=\"checkbox\"><p class=\"myIndexCheckbox\"><input type=\"checkbox\" id=\"indexColumn_"+id+"_"+table.columns[index].title+"_"+index+"\" onclick=\"hideShowColumnTable(id)\">"+table.columns[index].title+"</label>").appendTo('#indexColumn_'+id);
            $('#indexColumn_'+id+'_'+table.columns[index].title+"_"+index).prop('checked', true);
          }
      }
  
      function hideShowColumnTable(id){
        var numberOfTable=id.split("_")[1];
        var indexCol=id.substring(id.length-2);
        var i=indexCol.indexOf("_");
        if (i > -1){
          indexCol=indexCol.split("_")[1];
        }
        var table = $('#example'+numberOfTable).DataTable();
        
        if( $('#'+id).prop("checked") ){
          table.column( indexCol ).visible( true );
        }
        else{
          table.column( indexCol ).visible( false );
        }
        table.columns.adjust().draw();

        if( $('.myChart').is(':visible') ){
          var idForSwitchContent = "Content"+id.split("_")[4];
          switchTableChart(id);
        }
      }

      function drawGoogleChart(table, id){
        //var columnIndexes = filterColumnsForChart(table, id);
        //dal server, insieme ai dati viene inviato per ciascun grafico, l'indice dell'elemento di riferimento per l'asse x ed la sottostringa degli elementi da graficare nel chartS
        var keys = Object.keys(dati);
        var tableName = keys[id];
        /*if(dati[tableName]['stringColumns'] == undefined){
          alert('input Error! Please enter a valid column\'s name');
          return;
        }*/
        var columnIndexes = filterColumnsForChart(table, id, dati[tableName]['hAxis'], dati[tableName]['stringColumns']);

        var header = generateHeaderForChart(table, id, columnIndexes);

        var rows = generateRowsForChart(table, id, columnIndexes) ;
        
        rows = changeRowsFromStringToNumber(rows);
        
        var googleDataTable = dataTableToGoogleChartDataTable(header, rows, id);
        var hSelectedColumns_Body = calcHeightWindow('#SelectedColumns_Body');
        var hsectionResult_body_Tab = calcHeightWindow('#sectionResult_body_Tab');
        
        var hChart = $('#listingTag_Body').css('max-height').split("px")[0]-hsectionResult_body_Tab-20;
        var wChart = $('#sectionResult_body_Content').width()-20;

        var tableName = Object.keys(dati)[0];

        var options = {
              chart: {
                title: tableName
              },
              height: hChart,
              width: wChart,
              legend: {
                        alignament: "start"
                      }
              };
            
        chart = new google.charts.Bar(document.getElementById('chart_'+id));
        chart.draw(googleDataTable, options);

      }

      function filterColumnsForChart(table, id, indexVaxis, substring){
        var columnIndexesChecked = [];
        columnIndexesChecked[0]=indexVaxis;
        var keys = Object.keys(dati);
        var tableName = keys[id];

        $('#indexColumn_'+id).children().children().children().each(function(index,value){
          //console.log(value.id);
          //console.log(substring);
          if((value.checked) && ((value.id).search(substring)!= -1) && !isNaN(Number(table['data'][0][index] ) ) ){
            columnIndexesChecked.push(index);
          }
        });
        return columnIndexesChecked;
      }

      function generateHeaderForChart(table, id, columnIndexes){
        var header = [];
        for(i=0; i<columnIndexes.length; i++){
          header.push(table.columns[columnIndexes[i]].title);
        }
        return header;
      }

      function generateRowsForChart(table, id, columnIndexes){
        return table.data.map(function(row_data, row_index, row){
          return columnIndexes.map(function(col_index, index, columns){
            return row_data[col_index];
          });

        });
      }

      function changeRowsFromStringToNumber(rows){
        $(rows).each(function(indexRow,value){
          $(value).each(function(indexElement,val){
            if(indexElement != 0){
              rows[indexRow][indexElement] = Number(val);
            }
          });       
        });
        return rows;
      }

      function dataTableToGoogleChartDataTable(header, rows, id){
        return google.visualization.arrayToDataTable([header].concat(rows));
      }

      function switchTableChart(id){
        var idSectionActive= $('#sectionResult_body_Tab').children('.active').attr('id');
        var idForSwitchContent = idSectionActive.split("_")[2]+idSectionActive.split("_")[4];
        var buttonName = id.split("_")[3];

        if(buttonName == 'table'){
          $('#sectionResult_header_switchSection_chart').removeClass('active');    
          $('#sectionResult_header_switchSection_table').addClass('active');
        }
        else{
          $('#sectionResult_header_switchSection_table').removeClass('active');    
          $('#sectionResult_header_switchSection_chart').addClass('active');
        }
        switchContent(idForSwitchContent);
      }

      function switchContent(id){
        var index = id.split('Content')[1];

        var keys = Object.keys(dati);
        var tableName = keys[index];
        var dataTable = tableToDataTable(dati[tableName]);
        var hAxis = dati[tableName]['hAxis'];
        var stringColumns = dati[tableName]['stringColumns'];

        $('.myIndexColumn').hide();
        $('.myTable').hide();
        $('.myChart').hide();

        if( $('#sectionResult_header_switchSection_chart').is('.active') && (hAxis!=undefined) && (stringColumns!=undefined) ){
          $('#chart_'+index).show();
          $('#SelectColumnsForChart_Body_HaxisForm_Warning').empty();
          $('#SelectColumnsForChart_Body_ColumnsForm_Warning').empty();
          $('#SelectColumnsForChart_Body_HaxisForm').val(dati[tableName]['header'][hAxis]);
          $('#SelectColumnsForChart_Body_ColumnsForm').val(stringColumns);
          //console.log('chart_'+index);
          $(".myIndexCheckbox").show();
          filterDivColumnForChart(dati[tableName],index,hAxis,stringColumns);
          drawGoogleChart(dataTable,index);
        }
        else if ($('#sectionResult_header_switchSection_table').is('.active')){
          //console.log('table');
          $('#table_'+index).show();
          $('.myIndexCheckbox').show();
          $('#SelectColumnsForChart_Body_HaxisForm_Warning').empty();
          $('#SelectColumnsForChart_Body_ColumnsForm_Warning').empty();
          $('#SelectColumnsForChart_Body_HaxisForm').val('');
          $('#SelectColumnsForChart_Body_ColumnsForm').val('');      
        }
        else{
          $('#SelectColumnsForChart_Body_HaxisForm').val('');
          $('#SelectColumnsForChart_Body_ColumnsForm').val('');
          sendStringsForChart();
        }
        $('#indexColumn_'+index).show();
      }

      function filterDivColumnForChart(table, id, indexVaxis, substring){
        var columnIndexesChecked = [];
        var fistRowData =  table['data'][0];
        columnIndexesChecked[0]=indexVaxis;

        $('#indexColumn_'+id).children().children().children().each(function(index,value){
          var firstRowDataElementNumeric = Number(fistRowData[index]);
          if((value.id).search(substring) == -1 || (isNaN(firstRowDataElementNumeric)) ){
            $(value).parent().hide();
          }
        });
      }

      function sendStringsForChart(){
        var stringHaxis = "";
        var stringColumns ="";
        var idSectionActive= $('#sectionResult_body_Tab').children('.active').attr('id');
        var numberOfTable = idSectionActive.split("_")[4];
        var keys = Object.keys(dati);
        var filepath = keys[numberOfTable];
        $('#SelectColumnsForChart_Body_HaxisForm_Warning').empty();
        $('#SelectColumnsForChart_Body_ColumnsForm_Warning').empty();
        //console.log(filepath);
        setVaxisValue(filepath);

        setStringOfColumns(filepath);
      }

      function setVaxisValue(filepath){
        if($('#SelectColumnsForChart_Body_HaxisForm').val() != "" ){
          stringHaxis = $('#SelectColumnsForChart_Body_HaxisForm').val();
          stringHaxis = stringHaxis.split(" ")[0];
          var index = (dati[filepath]['header']).indexOf(stringHaxis);
          if(isNaN(Number(dati[filepath]['data'][0][index]))){
            dati[filepath]['hAxis'] = index;
          }
          //console.log(dati[filepath]['hAxis']);
        }
        else{
          $('#SelectColumnsForChart_Body_HaxisForm_Warning').text("*missing input.");
        }
      }

      function setStringOfColumns(filepath){
        if($('#SelectColumnsForChart_Body_ColumnsForm').val() != "" ){
          stringColumns = $('#SelectColumnsForChart_Body_ColumnsForm').val();
          stringColumns = stringColumns.split(" ")[0];
          dati[filepath]['stringColumns'] =  stringColumns;
          //console.log(dati[filepath]['stringColumns']);
          switchTableChart('sectionResult_header_switchSection_chart');
        }
        else{
          $('#SelectColumnsForChart_Body_ColumnsForm_Warning').text("*missing input.");
        }
      }
