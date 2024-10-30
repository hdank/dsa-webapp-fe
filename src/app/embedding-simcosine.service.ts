import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { cosineSimilarity } from './cosinefunction';

@Injectable({
  providedIn: 'root'
})
export class EmbeddingSimcosineService {
  private apiUrl = 'http://localhost:1234/v1/embeddings';//nhớ chỉnh lại nếu cần
  private jsonUrl = 'assets/bocauhoi.json';
  inputembedding: any;
  jsonfile: any;
  titles: string[] = [];
  titleEmbeddings: { [key: string]: number[] } = {};
  mostFittingTitle: string | null = null;
  userQuery: string = '';
  constructor(private http: HttpClient) {}
  getEmbedding(text: string): Observable<any> {
    const requestBody = {
      model: 'nomic-embed-text-v1.5',
      input: text
    };
    return this.http.post<any>(this.apiUrl, requestBody);
  }

  fetchEmbeddingquery(text: string) {
    this.getEmbedding(text).subscribe(
      (data) => {

        // console.log('Embedding for title:', text, 'Embedding:', data.data[0].embedding);
        // // Store the embedding in the titleEmbeddings object
        this.inputembedding = data.data[0].embedding;
        // console.log(this.inputembedding)
      },
      (error) => console.error('Error:', error)
    );
  }

  fetchEmbeddingtitle(text: string) {
    this.getEmbedding(text).subscribe(
      (data) => {
        // console.log('Embedding for title:', text, 'Embedding:', data.data[0].embedding);
        // Store the embedding in the titleEmbeddings object
        this.titleEmbeddings[text] = data.data[0].embedding;
      },
      (error) => console.error('Error:', error)
    );
  }

  loadJson(): Observable<any> {
    return this.http.get<any>(this.jsonUrl);
  }

  loadJsonToHTTP() {
    this.loadJson().subscribe(
      (data) => {
        // Extract titles
        this.titles = data.map((item: any) => item.title);
        // console.log('Titles:', this.titles);
        this.jsonfile = data
        // Embed each title
        this.titles.forEach((title) => {
          this.fetchEmbeddingtitle(title);
        });
      },
      (error) => console.error('Error loading JSON:', error)
    );
  }

  delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
  }

  async findMostFittingTitle(query: string) {
    this.loadJsonToHTTP()
    this.fetchEmbeddingquery(query)
    await this.delay(1000)
    let highestScore = -Infinity;
    let bestTitle: string | null = null;
    for (const [title, embedding] of Object.entries(this.titleEmbeddings)) {
      const score = cosineSimilarity(this.inputembedding, embedding);
      console.log(`Similarity between query and title "${title}": ${score}`);
      if (score > highestScore) {
        highestScore = score;
        bestTitle = title;
      }
      
    }
    this.mostFittingTitle = bestTitle;
    console.log('Most fitting title:', this.mostFittingTitle);
    const item = this.jsonfile.find((entry: { title: string | null; }) => entry.title === this.mostFittingTitle);
    console.log('content:',item.content)
  }
}
