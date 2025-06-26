import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.StandardOpenOption;
import java.util.LinkedList;
import java.util.Locale;
import java.util.Objects;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) throws IOException {

       Scanner sc = new Scanner(System.in);
       String floc = sc.nextLine();
        File s = new File("D:\\down\\markers\\geomarkers"+".geojson");
        s.createNewFile();
        FileWriter mf = new FileWriter(s,true);
        mf.write("{\"type\": \"FeatureCollection\", \"features\": [");
       while(!Objects.equals(floc, "end")){
           File skinet = new File("D:\\down\\"+floc+".txt");
           Scanner fscan = new Scanner(skinet);
           StringBuilder strb = new StringBuilder();
           String[] inp = fscan.nextLine().split(",");
           LinkedList<Double> lat=new LinkedList<Double>(),lon=new LinkedList<Double>(),price=new LinkedList<Double>(),sqm=new LinkedList<Double>();
           LinkedList<String> currency= new LinkedList<>();
           for (int i = 0; i < inp.length; i++) {
               if(inp[i].split(":").length >= 2) {
                   String a = inp[i].split(":")[0];


                   String d = inp[i].split(":")[1];

                   if (Objects.equals(a, "coords")) {
                       String b = inp[i].split(":")[2];
                       String c = inp[i + 1].split(":")[1];
                       lat.add(Double.parseDouble(b));
                       lon.add(Double.parseDouble((String) c.subSequence(0, c.length() - 2)));
                   } else if (Objects.equals(a, "price")) {
                       price.add(Double.parseDouble(d.replaceAll("\\s+", "")));
                   } else if (Objects.equals(a, "currencyCode")) {
                       currency.add(d);
                   } else if (Objects.equals(a, "sqm")) {
                       sqm.add(Double.parseDouble(d));
                   }
               }

           }
           for (int i = 0; i < price.size()-1; i++) {


               String gg = String.format(Locale.US, "{\"type\": \"Feature\", \"properties\": {\"price\": %f, \"currencyCode\": \"%s\", \"sqm\": %f}, \"geometry\": {\"type\": \"Point\",\"coordinates\": [%f,%f]}},", price.get(i), currency.get(i), sqm.get(i), lon.get(i), lat.get(i));

               mf.write(gg);
           }
           String gg = String.format(Locale.US, "{\"type\": \"Feature\", \"properties\": {\"price\": %f, \"currencyCode\": \"%s\", \"sqm\": %f}, \"geometry\": {\"type\": \"Point\",\"coordinates\": [%f,%f]}}", price.getLast(), currency.getLast(), sqm.getLast(), lon.getLast(), lat.getLast());
           mf.write(gg);
           floc = sc.nextLine();
           if(!Objects.equals(floc, "end")){
               mf.write(",");
           }
           else {
               mf.write("]}");
               mf.close();
           }

       }
    }
}